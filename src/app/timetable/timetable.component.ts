import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatTableModule } from '@angular/material/table';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MatAutocompleteModule, MatAutocompleteSelectedEvent } from '@angular/material/autocomplete';
import { MatChipsModule } from '@angular/material/chips';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { LiveAnnouncer } from '@angular/cdk/a11y';
import { ChangeDetectionStrategy, inject, signal, computed } from '@angular/core';
import { FormControl } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { toSignal } from '@angular/core/rxjs-interop';

@Component({
  selector: 'app-timetable',
  standalone: true,
  templateUrl: './timetable.component.html',
  styleUrls: ['./timetable.component.scss'],
  imports: [CommonModule, MatTableModule, MatAutocompleteModule, MatChipsModule, FormsModule, ReactiveFormsModule, MatButtonModule, MatFormFieldModule, MatIconModule],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class TimetableComponent implements OnInit {
  displayedColumns: string[] = ['day',  'time', 'stage', 'act'];
  acts = signal<any[]>([]);
  selectedActs = signal<string[]>([]);
  actCtrl = new FormControl('');
  actCtrlValue = toSignal(this.actCtrl.valueChanges, { initialValue: '' });
  allActs: string[] = [];

  announcer = inject(LiveAnnouncer);

  filteredActsData = computed(() => {
    const selected = this.selectedActs();
    const sortedAndFiltered = this.acts().filter(act => 
      selected.length === 0 || selected.includes(act.act)
    ).sort((a, b) => {
      // Compare days first
      if (a.day < b.day) return -1;
      if (a.day > b.day) return 1;
      // If days are equal, compare times
      if (a.time < b.time) return -1;
      if (a.time > b.time) return 1;
      return 0; // If both day and time are equal
    });
    return sortedAndFiltered;
  });

  filteredActs = computed(() => {
    const filterValue = this.actCtrlValue()?.toLowerCase() || '';
    const selected = this.selectedActs();
    return this.allActs
      .filter(act => !selected.includes(act))
      .filter(act => act.toLowerCase().includes(filterValue));
  });

  ngOnInit() {
    this.loadActs();
  }

  clearActs() {
    this.selectedActs.set([]);
    this.announcer.announce('Cleared all acts');
  }

  private loadActs() {
    const url = './assets/timetable.json';
    console.log(`Attempting to load acts from URL: ${url}`);
    fetch(url)
      .then(response => {
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        return response.json();
      })
      .then(data => {
        const allActs = [];
        for (const [day, stages] of Object.entries(data.festival)) {
          for (const [stageName, acts] of Object.entries(stages as any)) {
            const actsWithDayAndStage = (acts as any[]).map(act => ({
              ...act,
              day,
              stage: stageName
            }));
            allActs.push(...actsWithDayAndStage);
          }
        }
        this.acts.set(allActs);
        this.allActs = [...new Set(allActs.map(act => act.act))];
        console.log('Acts loaded successfully:', this.acts());
      })
      .catch(error => {
        console.error('Error loading acts:', error);
      });
  }

  removeAct(act: string): void {
    this.selectedActs.update(acts => acts.filter(a => a !== act));
    this.announcer.announce(`Removed ${act}`);
  }

  selected(event: MatAutocompleteSelectedEvent): void {
    const newAct = event.option.viewValue;
    if (this.allActs.includes(newAct) && !this.selectedActs().includes(newAct)) {
      this.selectedActs.update(acts => [...acts, newAct]);
      this.announcer.announce(`Added ${newAct}`);
    }
    this.actCtrl.setValue('');
  }
}