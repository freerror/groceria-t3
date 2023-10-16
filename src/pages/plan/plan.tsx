import { type Product } from "@prisma/client";
import { type Section } from "@prisma/client";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/router";
import { useClient } from "next/client";
import { type ReactElement, useState, useEffect } from "react";
import ReactMarkdown from "react-markdown";
import gfm from "remark-gfm";
import FormCols2 from "~/components/FormCols2";
import FormPage from "~/components/FormPage";
import { api } from "~/utils/api";
import useLocalStorage from "~/hooks/useLocalStorage";

type SectionNames = "recipes" | "products" | "groceries";

function NavLink(props: {
  current: SectionNames;
  section: SectionNames;
  onClick: (section: SectionNames) => void;
  children: ReactElement | string;
}) {
  return (
    <a
      className={
        props.current === props.section ? "text-black" : "text-gray-400"
      }
      onClick={() => {
        props.onClick(props.section);
      }}
    >
      {props.children}
    </a>
  );
}

const Checkbox = () => <input type="checkbox" />;

function Section(props: {
  title: string;
  nextSection?: SectionNames;
  previousSection?: SectionNames;
  children: ReactElement | string | ReactElement[] | undefined;
  filter?: string;
  onFilter?: (a: string) => void | undefined;
  setSection: (section: SectionNames) => void;
}) {
  return (
    <div className="flex h-full flex-col justify-between">
      <div className="flex justify-between">
        <h2 className="my-4 truncate">{props.title}</h2>
        {props.onFilter !== undefined ? (
          <input
            type="text"
            className="m-3 max-h-10 min-w-0 rounded-lg border-[1px] p-2 shadow-inner"
            placeholder="Filter"
            value={props.filter || ""}
            onChange={(e) => {
              if (props.onFilter) {
                props.onFilter(e.target.value);
              }
            }}
          />
        ) : (
          ""
        )}
      </div>
      <div className="mb-4 flex h-full flex-col gap-3 overflow-scroll rounded-2xl border p-3 shadow-inner">
        {props.children}
      </div>
      <div className="flex flex-row gap-2 self-end">
        <button
          className="btn-sm btn"
          disabled={props.previousSection === undefined}
          onClick={() => {
            if (props.previousSection) props.setSection(props.previousSection);
          }}
        >
          Previous
        </button>
        <button
          className="btn-sm btn"
          disabled={props.nextSection === undefined}
          onClick={() => {
            if (props.nextSection) props.setSection(props.nextSection);
          }}
        >
          Next
        </button>
      </div>
    </div>
  );
}

type CountableProduct = { count: number } & Product & {
    section: Section | null;
  };

function Plan() {
  const recipeProducts = api.recipeRelations.getAll.useQuery().data ?? [];
  const recipes = api.recipe.getAll.useQuery().data ?? [];
  const productData = api.product.getAll.useQuery().data;

  const router = useRouter();

  const [section, setSection] = useState<SectionNames>("recipes");
  const [chosenRecipes, setChosenRecipes] = useLocalStorage<string[]>(
    "chosenRecipes",
    []
  );
  const [products, setProducts] = useLocalStorage<CountableProduct[]>(
    "products",
    []
  );

  useEffect(() => {
    if (productData && products.length === 0) {
      setProducts(
        productData.map((prod) => ({
          count: 0,
          ...prod,
        }))
      );
    }
  }, [productData, products, setProducts]);

  function handleNav(section: SectionNames) {
    setSection(section);
  }
  function handleChooseRecipe(recipe: string): void {
    setChosenRecipes((prev) => [...prev, recipe]);
  }
  function handleUpdateProductsFromRecipes(
    recipeId: string,
    increment: 1 | -1 = 1
  ) {
    const recProducts = recipeProducts
      .filter((rel) => rel.recipeId === recipeId)
      .map((rel) => rel.productId);
    const updates = recProducts.reduce<{ [key: string]: number }>((acc, id) => {
      acc[id] = (acc[id] || 0) + increment;
      return acc;
    }, {});
    handleUpdateProducts(updates);
  }

  function handleUpdateProducts(updates: { [key: string]: number }) {
    setProducts((prev) =>
      prev.map((prod) => {
        let newCount = prod.count + (updates[prod.id] || 0);
        if (newCount < 0) {
          newCount = 0;
        }
        return {
          ...prod,
          count: newCount,
        };
      })
    );
  }

  function generateGroceryList() {
    const currentDate = new Date();
    const formattedDate = `${currentDate.getFullYear()}-${String(
      currentDate.getMonth() + 1
    ).padStart(2, "0")}-${String(currentDate.getDate()).padStart(
      2,
      "0"
    )} ${String(currentDate.getHours()).padStart(2, "0")}:${String(
      currentDate.getMinutes()
    ).padStart(2, "0")}`;
    const chosenProducts = products.filter((prod) => prod.count > 0);
    const sectionData = chosenProducts.map((prod) => prod.section) as Section[];
    const sections = sectionData.filter(
      (section, idx, self) => idx === self.findIndex((t) => t.id === section.id)
    );
    sections.sort((a, b) => b.id.localeCompare(a.id));
    const markdown =
      `## Shopping List ${formattedDate}\n\n` +
      sections
        .map(
          (sect) =>
            `### ${sect.title}\n${chosenProducts
              .filter((prod) => prod.sectionId === sect.id)
              .map(
                (prod) =>
                  `* [ ] ${prod.title} (${prod.count})${
                    prod.checkStock ? " _**check stock**_" : ""
                  }`
              )
              .join("\n")}`
        )
        .join("\n\n");

    return (
      <>
        <button
          className="btn-outline btn-sm btn w-1/5 self-center"
          onClick={(e) => {
            void navigator.clipboard.writeText(markdown);
            const btn = e.target as HTMLElement;
            btn.innerText = "COPIED";
          }}
        >
          Copy
        </button>
        <h1 className="mb-0">Groceries</h1>
        <ReactMarkdown remarkPlugins={[gfm]} components={{ input: Checkbox }}>
          {markdown}
        </ReactMarkdown>
      </>
    );
  }

  return (
    <FormPage>
      <div className="not-prose breadcrumbs text-sm">
        <ul>
          <li>
            <NavLink current={section} section="recipes" onClick={handleNav}>
              Choose Recipes
            </NavLink>
          </li>
          <li>
            <NavLink current={section} section="products" onClick={handleNav}>
              Choose Products
            </NavLink>
          </li>
          <li>
            <NavLink current={section} section="groceries" onClick={handleNav}>
              Share Grocery List
            </NavLink>
          </li>
        </ul>
      </div>
      <FormCols2
        panel={
          <>
            {section === "recipes" ? (
              <Section
                title="Choose Recipes"
                nextSection="products"
                filter={(router.query.recipeFilter as string) || ""}
                onFilter={(a) => {
                  void router.push({
                    pathname: router.pathname,
                    query: {
                      recipeFilter: a,
                      productFilter:
                        (router.query.productFilter as string) || "",
                    },
                  });
                }}
                setSection={setSection}
              >
                <>
                  {recipes.length === 0 ? (
                    <>
                      <label className="m-2 rounded-lg border p-3 text-center text-lg font-bold">
                        You have no recipes
                      </label>
                      <label className="m-2 rounded-lg border p-3 text-center text-lg font-bold">
                        <Link href="/products/create">
                          Step 1: Create Products
                        </Link>
                      </label>
                      <label className="m-2 rounded-lg border p-3 text-center text-lg font-bold">
                        <Link href="/recipes/create">
                          Step 2: Create Recipes
                        </Link>
                      </label>
                    </>
                  ) : (
                    ""
                  )}
                  {recipes
                    .filter((recipe) =>
                      recipe.title
                        .toLowerCase()
                        .includes(
                          (
                            (router.query.recipeFilter as string) || ""
                          ).toLowerCase()
                        )
                    )
                    .map((recipe, idx) => {
                      const ingreds: Product[] = [];
                      recipeProducts
                        ?.filter((rel) => rel.recipeId === recipe.id)
                        .forEach((rel) => {
                          const found = productData?.find(
                            (prod) => prod.id === rel.productId
                          );
                          if (found) ingreds.push(found);
                        });
                      ingreds.sort((a, b) => a.title.localeCompare(b.title));
                      const ingredTitles: string[] = ingreds.map((ing) =>
                        ing ? ing.title : "Error"
                      );

                      return (
                        <div
                          key={idx}
                          className="flex h-[140px] rounded-xl bg-primary-content shadow-xl"
                        >
                          <figure className="m-0 h-[140px] w-[100px] shrink-0 rounded-l-xl rounded-r-none">
                            <Image
                              src="/img/recipe_generic.jpg"
                              alt="Recipe"
                              width={200}
                              height={280}
                            />
                          </figure>
                          <div className="flex flex-shrink flex-grow flex-col items-start justify-start overflow-hidden px-1">
                            <div className="w-full">
                              <h3 className="m-0 truncate whitespace-nowrap">
                                {recipe.title}
                              </h3>
                            </div>
                            <div className="mb-2 h-full w-full overflow-scroll rounded-lg pl-1 pr-2 pt-2 shadow-inner">
                              <p className="m-0 text-xs font-thin">
                                {ingredTitles.join(", ") + "."}
                              </p>
                            </div>
                            {chosenRecipes.includes(recipe.id) ? (
                              <button
                                className="btn-error btn-sm btn mb-2 ml-auto mr-2 mt-auto w-[80px]"
                                onClick={() => {
                                  setChosenRecipes((prev) =>
                                    prev.filter((r) => r != recipe.id)
                                  );
                                  handleUpdateProductsFromRecipes(
                                    recipe.id,
                                    -1
                                  );
                                }}
                              >
                                Remove
                              </button>
                            ) : (
                              <button
                                className="btn-success btn-sm btn mb-2 ml-auto mr-2 mt-auto w-[80px]"
                                onClick={() => {
                                  handleChooseRecipe(recipe.id);
                                  handleUpdateProductsFromRecipes(recipe.id);
                                }}
                              >
                                Choose
                              </button>
                            )}
                          </div>
                        </div>
                      );
                    })}
                </>
              </Section>
            ) : (
              ""
            )}
            {section === "products" ? (
              <Section
                title="Products"
                nextSection="groceries"
                previousSection="recipes"
                setSection={setSection}
                onFilter={(a) => {
                  void router.push({
                    pathname: router.pathname,
                    query: {
                      productFilter: a,
                      recipeFilter: (router.query.recipeFilter as string) || "",
                    },
                  });
                }}
                filter={(router.query.productFilter as string) || ""}
              >
                <>
                  {products.length === 0 ? (
                    <>
                      <label className="m-2 rounded-lg border p-3 text-center text-lg font-bold">
                        You have no products
                      </label>
                      <label className="m-2 rounded-lg border p-3 text-center text-lg font-bold">
                        <Link href="/products/create">Create Products</Link>
                      </label>
                    </>
                  ) : (
                    ""
                  )}
                  {products
                    .filter((product) =>
                      product.title
                        .toLowerCase()
                        .includes(
                          (
                            (router.query.productFilter as string) || ""
                          ).toLowerCase()
                        )
                    )
                    .map((prod, idx) => {
                      return (
                        <div
                          key={idx}
                          className="grid grid-cols-2 gap-2 rounded-xl bg-primary-content p-2 shadow-md"
                        >
                          <div className="truncate whitespace-nowrap pl-2 font-bold">
                            {prod.title}
                          </div>
                          <div className="flex justify-end">
                            <button
                              className="btn-error btn-square btn-sm btn rounded-none rounded-l-xl"
                              onClick={() => {
                                handleUpdateProducts({ [prod.id]: -1 });
                              }}
                            >
                              -
                            </button>
                            <div className="w-full max-w-[4rem] bg-neutral-50 text-center shadow-inner">
                              {prod.count}
                            </div>
                            <button
                              className="btn-success btn-square btn-sm btn rounded-none rounded-r-xl"
                              onClick={() => {
                                handleUpdateProducts({ [prod.id]: 1 });
                              }}
                            >
                              +
                            </button>
                          </div>
                        </div>
                      );
                    })}
                </>
              </Section>
            ) : (
              ""
            )}
            {section === "groceries" ? (
              <Section
                title="Share Grocery List"
                previousSection="products"
                setSection={setSection}
              >
                {generateGroceryList()}
              </Section>
            ) : (
              ""
            )}
          </>
        }
      />

      <FormCols2
        panel={
          <>
            <h2>Chosen Meals</h2>
            <div className="mb-4 flex h-full flex-col gap-4 overflow-scroll rounded-2xl border p-3 shadow-inner">
              {chosenRecipes.length <= 0 ? (
                <label className="m-2 rounded-lg border p-3 text-center text-lg font-bold">
                  No meals chosen
                </label>
              ) : (
                ""
              )}
              <ul className="m-0 pl-0">
                {recipes
                  .filter((recipe) => chosenRecipes.includes(recipe.id))
                  .map((recipe, idx) => (
                    <li
                      key={idx}
                      className="m-2 flex list-none flex-row rounded-lg border bg-primary-content p-3 text-lg font-bold"
                    >
                      <div className="flex-grow pl-3">{recipe.title}</div>
                      <button
                        className="btn-error btn-sm btn w-[80px]"
                        onClick={() => {
                          setChosenRecipes((prev) =>
                            prev.filter((r) => r != recipe.id)
                          );
                          handleUpdateProductsFromRecipes(recipe.id, -1);
                        }}
                      >
                        Remove
                      </button>
                    </li>
                  ))}
              </ul>
            </div>
          </>
        }
      />

      <FormCols2
        panel={
          <>
            <h2>Products</h2>
            <div className="mb-4 flex h-full flex-col gap-4 overflow-scroll rounded-2xl border p-3 shadow-inner">
              {!products.find((prod) => prod.count > 0) ? (
                <label className="m-2 rounded-lg border p-3 text-center text-lg font-bold">
                  No Products Selected
                </label>
              ) : (
                ""
              )}
              <ul className="m-0 pl-0">
                {products
                  .filter((product) => product.count > 0)
                  .map((prod, idx) => (
                    <li
                      key={idx}
                      className="m-2 flex list-none flex-row rounded-lg border bg-primary-content p-3 text-lg font-bold"
                    >
                      <div className="flex-grow pl-3">{prod.title}</div>
                      <button
                        className="btn-error btn-sm btn w-[80px]"
                        onClick={() => {
                          handleUpdateProducts({ [prod.id]: -1 });
                        }}
                      >
                        Remove
                      </button>
                    </li>
                  ))}
              </ul>
            </div>
          </>
        }
      />
    </FormPage>
  );
}

export default Plan;
