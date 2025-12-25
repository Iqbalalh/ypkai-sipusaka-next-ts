import { Input } from "antd";
import type { KeyboardEvent, ClipboardEvent, ChangeEvent } from "react";

interface InputPhoneProps {
  value?: string;
  onChange?: (value: string) => void;
  maxLength?: number;
  size?: "small" | "middle" | "large";
}

const InputPhone = ({ value = "", onChange, maxLength, size }: InputPhoneProps) => {
  const handleChange = (e: ChangeEvent<HTMLInputElement>) => {
    let val = e.target.value.replace(/\D/g, "");
    if (maxLength) val = val.slice(0, maxLength);
    onChange?.(val);
  };

  const handleKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
    if (["e", "E", "+", "-", "."].includes(e.key)) {
      e.preventDefault();
    }
  };

  const handlePaste = (e: ClipboardEvent<HTMLInputElement>) => {
    const pasted = e.clipboardData.getData("text");
    if (!/^\d+$/.test(pasted)) {
      e.preventDefault();
    }
  };

  return (
    <Input
      type="text"
      inputMode="numeric"
      value={value}
      size={size}
      onChange={handleChange}
      onKeyDown={handleKeyDown}
      onPaste={handlePaste}
    />
  );
};

export default InputPhone;
