import { signIn, signOut, useSession } from "next-auth/react";
import Image from "next/image";
import Link from "next/link";

function Header() {
  const { data: sessionData } = useSession();

  const handleClickMenuItem = (
    e: React.MouseEvent<HTMLLIElement, MouseEvent>
  ) => {
    const el = e.target as HTMLUListElement;
    el?.blur();
  };

  return (
    <div className="navbar bg-neutral text-neutral-content">
      <div className="flex-none">
        <div className="dropdown-bottom dropdown">
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
            className="dropdown-content menu rounded-box menu-compact mt-3 w-52 bg-neutral-100 p-2 text-base-content shadow"
          >
            <li onClick={handleClickMenuItem}>
              <Link href="/products/create">Products</Link>
            </li>
            <li onClick={handleClickMenuItem}>
              <Link href="/recipes/create">Recipes</Link>
            </li>
            <li>
              <a>Grocery Lists</a>
            </li>
          </ul>
        </div>
      </div>
      <div className="flex-1">
        <Link href="/" className="btn-ghost btn text-xl normal-case">
          Groceria
        </Link>
      </div>
      <div className="dropdown dropdown-end">
        {sessionData?.user ? (
          <>
            <label tabIndex={0} className="btn-ghost btn-circle avatar btn ">
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
              className="dropdown-content menu rounded-box menu-compact mt-3 w-52 bg-neutral-100 p-2 text-base-content shadow"
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
