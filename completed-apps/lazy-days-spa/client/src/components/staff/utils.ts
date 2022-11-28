import type { Staff } from '../../../../shared/types';

export function filterByTreatment(staff: any, treatmentName: string): Staff[] {
  console.log('sss', staff);
  return staff.filter((person) =>
    person.treatmentNames
      .map((t) => t.toLowerCase())
      .includes(treatmentName.toLowerCase())
  );
}
