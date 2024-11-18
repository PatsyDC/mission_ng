import { ComponentFixture, TestBed } from '@angular/core/testing';

import { EditarPresentacionComponent } from './editar-presentacion.component';

describe('EditarPresentacionComponent', () => {
  let component: EditarPresentacionComponent;
  let fixture: ComponentFixture<EditarPresentacionComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [EditarPresentacionComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(EditarPresentacionComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
