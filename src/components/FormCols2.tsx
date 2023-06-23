import { type ReactElement } from "react";

function FormCols2(props: {
  panel?: ReactElement;
  leftPanel?: ReactElement;
  rightPanel?: ReactElement;
}) {
  return (
    <div className="m-0 my-1 grid grid-cols-1 justify-center gap-3 sm:m-2 sm:grid-cols-2">
      {props.panel ? (
        <div className="card prose rounded-box col-span-2 h-[600px] max-w-none bg-neutral-100 p-5">
          {props.panel}
        </div>
      ) : (
        ""
      )}
      {props.leftPanel ? (
        <div className="card prose rounded-box col-span-1 h-[600px] max-w-none bg-neutral-100 p-5">
          {props.leftPanel}
        </div>
      ) : (
        ""
      )}
      {props.rightPanel ? (
        <div className="card prose rounded-box col-span-1 min-h-[600px] max-w-none bg-neutral-100 p-5">
          {props.rightPanel}
        </div>
      ) : (
        ""
      )}
    </div>
  );
}

export default FormCols2;
