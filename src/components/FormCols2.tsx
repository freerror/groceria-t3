import { type ReactElement } from "react";

interface FormCols2Props {
  panel?: ReactElement;
  leftPanel?: ReactElement;
  rightPanel?: ReactElement;
}

function FormCols2({ panel, leftPanel, rightPanel }: FormCols2Props) {
  return (
    <div className="m-0 my-1 grid grid-cols-1 justify-center gap-3 sm:m-2 sm:grid-cols-2">
      {panel && (
        <div className="card prose rounded-box col-span-2 h-[600px] max-w-none bg-neutral-100 p-5 shadow-md">
          {panel}
        </div>
      )}
      {leftPanel && (
        <div className="card prose rounded-box col-span-1 h-[600px] max-w-none bg-neutral-100 p-5 shadow-md">
          {leftPanel}
        </div>
      )}
      {rightPanel && (
        <div className="card prose rounded-box col-span-1 min-h-[600px] max-w-none bg-neutral-100 p-5 shadow-md">
          {rightPanel}
        </div>
      )}
    </div>
  );
}

export default FormCols2;
