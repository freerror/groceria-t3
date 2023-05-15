import { signIn, signOut, useSession } from "next-auth/react";
import Image from "next/image";

function Header() {
  const { data: sessionData } = useSession();

  return (
    <div className="navbar bg-neutral text-neutral-content">
      <div className="flex-none">
        <div className="dropdown dropdown-bottom">
          <label tabIndex={0} className="btn-ghost btn-square btn">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
              className="inline-block h-5 w-5 stroke-current"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d="M4 6h16M4 12h16M4 18h16"
              ></path>
            </svg>
          </label>
          <ul
            tabIndex={1}
            className="dropdown-content menu rounded-box menu-compact mt-3 w-52 p-2 text-base-content shadow"
          >
            <li>
              <a>Products</a>
            </li>
            <li>
              <a>Recipes</a>
            </li>
            <li>
              <a>Grocery Lists</a>
            </li>
          </ul>
        </div>
      </div>
      <div className="flex-1">
        <a className="btn-ghost btn text-xl normal-case">Groceria</a>
      </div>
      <div className="dropdown-end dropdown">
        {sessionData?.user ? (
          <>
            <label tabIndex={0} className="btn-ghost btn-circle avatar btn">
              <div className="w-10 rounded-full">
                <Image
                  width="40"
                  height="40"
                  src={sessionData?.user?.image ?? ""}
                  alt={sessionData?.user?.name ?? ""}
                />
              </div>
            </label>
            <ul
              tabIndex={1}
              className="dropdown-content menu rounded-box menu-compact mt-3 w-52 p-2 text-base-content shadow"
            >
              <li>
                <a>Profile</a>
              </li>
              <li>
                <a>Settings</a>
              </li>
              <li>
                <a onClick={() => void signOut()}>Logout</a>
              </li>
            </ul>
          </>
        ) : (
          <button
            className="btn-ghost rounded-btn btn"
            onClick={() => void signIn()}
          >
            Sign in
          </button>
        )}
      </div>
    </div>
  );
}

export default Header;
