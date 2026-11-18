import { InfoTooltip } from '../ui/InfoTooltip';
import { DigitalProductIcon } from './CartIcons';

export function DigitalProductHelp() {
  return (
    <InfoTooltip
      label="About digital products"
      text="You are buying a digital version of the product. You will receive a product key that can be activated on appropriate platform."
    >
      <DigitalProductIcon />
    </InfoTooltip>
  );
}
