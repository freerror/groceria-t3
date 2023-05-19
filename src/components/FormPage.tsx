import { type ReactElement } from "react";

function FormPage(props: { children: ReactElement }) {
  return (
    <div className="m-4">
      <div className="m-auto max-w-6xl">{props.children}</div>
    </div>
  );
}

export default FormPage;
