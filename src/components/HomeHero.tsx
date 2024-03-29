import { useSession } from "next-auth/react";
import { signIn } from "next-auth/react";
import Link from "next/link";

function HomeHero() {
  const { data: sessionData } = useSession();

  return (
    <div className="hero min-h-screen bg-super">
      <div className="hero-overlay bg-stone-500 bg-opacity-90"></div>
      <div className="hero-content text-justify text-neutral-content">
        <div className="flex max-w-md flex-col items-center gap-8 font-mono">
          <h1 className="text-5xl font-bold">Groceria!</h1>
          <p>
            Groceria is an online tool that lets you define your own groceries
            and recipes. You can create recipes from scratch and generate and
            customize grocery lists based on your weekly menu. Groceria makes
            cooking and shopping easy and fun. Try it today!
          </p>
          <h1 className="text-4xl">Features</h1>
          <ul className="list-inside list-disc">
            <li className="">Define your own recipes and grocery products</li>
            <li>Generate markdown grocery lists</li>
            <li>
              Coming Soon:
              <ul className="list-inside list-disc pl-5">
                <li>Its your data: JSON Import and export</li>
                <li>Share your grocery list with your shopper!</li>
              </ul>
            </li>
          </ul>
          {sessionData?.user ? (
            <>
              <Link href="/plan/plan" className="btn-primary btn mt-5">
                Get Started
              </Link>
            </>
          ) : (
            <>
              <button
                onClick={() => void signIn()}
                className="btn-primary btn mt-5"
              >
                Sign In
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  );
}

export default HomeHero;
