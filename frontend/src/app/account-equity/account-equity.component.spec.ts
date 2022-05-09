import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AccountEquityComponent } from './account-equity.component';

describe('AccountEquityComponent', () => {
  let component: AccountEquityComponent;
  let fixture: ComponentFixture<AccountEquityComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ AccountEquityComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(AccountEquityComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
