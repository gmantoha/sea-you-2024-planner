import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { TimetableComponent } from './timetable/timetable.component'; // Adjust the path as necessary

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet, TimetableComponent],
  templateUrl: './app.component.html',
  styleUrl: './app.component.scss'
})
export class AppComponent {
  title = 'sea-you-2024-planner';
}
