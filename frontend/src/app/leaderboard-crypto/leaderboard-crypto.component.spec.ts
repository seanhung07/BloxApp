import { ComponentFixture, TestBed } from '@angular/core/testing';

import { LeaderboardCryptoComponent } from './leaderboard-crypto.component';

describe('LeaderboardCryptoComponent', () => {
  let component: LeaderboardCryptoComponent;
  let fixture: ComponentFixture<LeaderboardCryptoComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ LeaderboardCryptoComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(LeaderboardCryptoComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
