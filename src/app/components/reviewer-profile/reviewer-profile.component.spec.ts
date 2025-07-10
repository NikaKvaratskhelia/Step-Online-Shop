import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ReviewerProfileComponent } from './reviewer-profile.component';

describe('ReviewerProfileComponent', () => {
  let component: ReviewerProfileComponent;
  let fixture: ComponentFixture<ReviewerProfileComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ReviewerProfileComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ReviewerProfileComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
