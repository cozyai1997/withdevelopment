export function StatusMessage({ message }: { message?: string | string[] }) {
  const text = Array.isArray(message) ? message[0] : message;

  if (!text) {
    return null;
  }

  return <p className="message">{text}</p>;
}
