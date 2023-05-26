import Image from "next/image";
import { type ReactElement, useState } from "react";
import FormCols2 from "~/components/FormCols2";
import FormPage from "~/components/FormPage";
import { api } from "~/utils/api";

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

function Section(props: {
  title: string;
  nextSection?: SectionNames;
  previousSection?: SectionNames;
  children: ReactElement | string | ReactElement[] | undefined;
  setSection: (section: SectionNames) => void;
}) {
  return (
    <div className="flex h-full flex-col justify-between">
      <div>
        <h2 className="mt-0">{props.title}</h2>
      </div>
      <div className="mb-4 flex h-full flex-col gap-4 overflow-scroll rounded-2xl border p-3 shadow-inner">
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

function Plan() {
  const [section, setSection] = useState<SectionNames>("recipes");
  const { data: recipes } = api.recipe.getAll.useQuery();
  const { data: recipeProducts } = api.recipeRelations.getAll.useQuery();
  const products = api.product.getAll.useQuery().data || [];

  function handleNav(section: SectionNames) {
    setSection(section);
  }

  return (
    <FormPage>
      <div className="breadcrumbs text-sm">
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
        topPanel={
          <>
            {section === "recipes" ? (
              <Section
                title="Choose Recipes"
                nextSection="products"
                setSection={setSection}
              >
                {recipes?.map((recipe, idx) => {
                  const ingreds: string[] = [];
                  recipeProducts
                    ?.filter((rel) => rel.recipeId === recipe.id)
                    .forEach((rel) => {
                      ingreds.push(
                        (
                          products.find(
                            (prod) => prod.id === rel.productId
                          ) || { title: "" }
                        ).title
                      );
                    });
                  ingreds.sort((a, b) => a.localeCompare(b));
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
                      <div className="flex flex-shrink flex-grow flex-col items-start justify-start overflow-hidden pl-2">
                        <div className="w-full">
                          <h3 className="m-0 truncate whitespace-nowrap">
                            {recipe.title}
                          </h3>
                        </div>
                        <div className="mb-2 h-full w-full overflow-scroll pr-2">
                          <p className="m-0 text-xs font-thin">
                            {ingreds.join(", ") + "."}
                          </p>
                        </div>
                        <button className="btn-primary btn-sm btn mb-2 ml-auto mr-2 mt-auto w-[80px]">
                          Choose
                        </button>
                      </div>
                    </div>
                  );
                })}
              </Section>
            ) : (
              ""
            )}
            {section === "products" ? (
              <Section
                title="Tweak Products"
                nextSection="groceries"
                previousSection="recipes"
                setSection={setSection}
              >
                Stuff
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
                Stuff
              </Section>
            ) : (
              ""
            )}
          </>
        }
      />
    </FormPage>
  );
}

export default Plan;
