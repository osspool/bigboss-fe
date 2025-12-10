import Image from "next/image";

const humanize = (value = "") =>
  value
    .replace(/[-_]+/g, " ")
    .replace(/\s+/g, " ")
    .trim();

const titleCase = (value = "") =>
  value
    .split(" ")
    .filter(Boolean)
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(" ");

const altFromSrc = (src = "") => {
  if (!src) return "";
  const fileName = src.split("?")[0]?.split("/").pop() || "";
  const baseName = fileName.split(".")[0];
  return titleCase(humanize(baseName));
};

const resolveAlt = ({ alt, fallbackAlt, title, description, src, defaultAlt }) => {
  const candidates = [alt, fallbackAlt, title, description, altFromSrc(src), defaultAlt];
  return candidates
    .map((candidate) => candidate?.toString().trim())
    .find((candidate) => candidate && candidate.length > 0);
};

export function SmartImage({
  alt,
  fallbackAlt,
  title,
  description,
  defaultAlt = "Bigboss Retail",
  src,
  ...props
}) {
  const resolvedAlt = resolveAlt({ alt, fallbackAlt, title, description, src, defaultAlt });

  return <Image src={src} alt={resolvedAlt} {...props} />;
}
