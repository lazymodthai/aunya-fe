import { QRCodeCanvas } from "qrcode.react";
import { generatePromptPayPayload } from "../../utils/promptpay";
import IconThaiQR from "../../assets/icons/icon-thaiqr.png";

type Props = {
  qrId: string;
  value: number;
  size?: number;
};

function QRPayment({ qrId, value, size = 200 }: Props) {
  return (
    <QRCodeCanvas
      value={generatePromptPayPayload(qrId, value)}
      size={size}
      level="M"
      includeMargin={true}
      imageSettings={{
        src: IconThaiQR,
        x: undefined,
        y: undefined,
        height: 28,
        width: 28,
        opacity: 1,
        excavate: true,
      }}
    />
  );
}

export default QRPayment;

