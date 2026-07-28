import { getTheProperty } from "../repositories/propertyRepository";
import { upsertRateOverride } from "../repositories/rateRepository";
import { parseDateOnly } from "../utils/dateUtils";
import { SetRateInput } from "../validation/schemas";

export async function setRate(input: SetRateInput) {
  const property = await getTheProperty();
  const startDate = parseDateOnly(input.startDate);
  const endDate = parseDateOnly(input.endDate);

  const override = await upsertRateOverride(property.id, startDate, endDate, input.nightlyRate);
  return override;
}
