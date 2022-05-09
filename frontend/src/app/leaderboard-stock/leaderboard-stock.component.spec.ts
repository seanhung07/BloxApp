import { ComponentFixture, TestBed } from '@angular/core/testing';

import { LeaderboardStockComponent } from './leaderboard-stock.component';

describe('LeaderboardStockComponent', () => {
  let component: LeaderboardStockComponent;
  let fixture: ComponentFixture<LeaderboardStockComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ LeaderboardStockComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(LeaderboardStockComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
