import { QRCodeCanvas } from "qrcode.react";
import { generatePromptPayPayload } from "../../utils/promptpay";
import IconThaiQR from "../../assets/icons/icon-thaiqr.png"
type Props = {
  qrId: string;
  value: number;
};

function QRPayment(props:Props) {
  return (
    <QRCodeCanvas
      value={generatePromptPayPayload(props.qrId, props.value)}
      imageSettings={{
        src: IconThaiQR,
        x: undefined,
        y: undefined,
        height: 24,
        width: 24,
        opacity: 1,
        excavate: true,
      }}
    />
  );
}

export default QRPayment;
