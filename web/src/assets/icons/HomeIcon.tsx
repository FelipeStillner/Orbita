interface HomeIconProps {
  filled?: boolean;
}

export function HomeIcon({ filled = false }: HomeIconProps) {
  const path = "M12 3L3 11v10h6v-6h6v6h6V11L12 3z";

  if (filled) {
    return (
      <svg
        xmlns="http://www.w3.org/2000/svg"
        width="24"
        height="24"
        viewBox="0 0 24 24"
        fill="currentColor"
      >
        <path d={path} />
      </svg>
    );
  }

  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d={path} />
    </svg>
  );
}
