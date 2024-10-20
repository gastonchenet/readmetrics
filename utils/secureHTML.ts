export default function secureHTML(text: string) {
  return text.replace(
    /[\u00A0-\u9999<>\&]/gim,
    (char: string) => "&#" + char.charCodeAt(0) + ";"
  );
}
