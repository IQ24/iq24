import { Avatar } from "@iq24/ui/avatar";
import { cn } from "@iq24/ui/cn";
import Image from "next/image";
import { useState } from "react";

type Props = {
  src: string | null;
  alt: string;
  size?: number;
};

export function BankLogo({ src, alt, size = 34 }: Props) {
  const [hasError, setHasError] = useState(false);

  return (
    <Avatar style={{ width: size, height: size }}>
      {src && !hasError && (
        <Image
          src={src}
          alt={alt}
          className="text-transparent object-contain bg-primary"
          width={size}
          height={size}
          quality={100}
          onError={() => setHasError(true)}
        />
      )}
      <Image
        src="https://cdn-engine.iq24.ai/default.jpg"
        alt={alt}
        className={cn(
          "absolute object-contain",
          src && "opacity-0",
          !src || hasError ? "" : "-z-10",
        )}
        width={size}
        height={size}
      />
    </Avatar>
  );
}
