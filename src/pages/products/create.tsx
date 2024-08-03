import { type Product, type Section } from "@prisma/client";
// import { useSession } from "next-auth/react";
import { useEffect, useRef, useState } from "react";
import Form2PanelLayout from "~/components/FormCols2";
import FormPage from "~/components/FormPage";
import { api } from "~/utils/api";

type SortType =
  | "productDescending"
  | "productAscending"
  | "sectionDescending"
  | "sectionAscending";

function Create() {
  const [newSectionTitle, setNewSectionTitle] = useState<string>("");
  const [newSection, setNewSection] = useState<boolean>(false);
  const [editProductId, setEditProductId] = useState<string | null>(null);
  const [productsLoaded, setProductsLoaded] = useState<boolean>(false);
  const [tableData, setTableData] = useState<Product[]>([]);
  const [sort, setSort] = useState<SortType>("productDescending");
  const [sectionId, setSectionId] = useState<string | undefined | null>(null);
  const sectionOptions = useRef<HTMLSelectElement>(null);
  const [checkStock, setCheckStock] = useState<boolean>(false);
  const [publicProduct, setPublicProduct] = useState<boolean>(false);
  const [productTitle, setProductTitle] = useState<string>("");
  // const { data: sessionData } = useSession();
  const createProduct = api.product.create.useMutation({
    onSuccess: async () => {
      await refetchProducts();
      setProductsLoaded(false);
    },
  });
  const updateProduct = api.product.update.useMutation({
    onSuccess: async () => {
      await refetchProducts();
      setProductsLoaded(false);
    },
  });
  const deleteProduct = api.product.delete.useMutation({
    onSuccess: async () => {
      await refetchProducts();
      setProductsLoaded(false);
    },
  });
  const createSection = api.section.create.useMutation({
    onSuccess: async (res) => {
      await refetchSections();
      handleSave(res.id);
    },
  });
  const { data: products, refetch: refetchProducts } =
    api.product.getAll.useQuery();
  const { data: sections, refetch: refetchSections } =
    api.section.getAll.useQuery();

  function getSectionName(sectionId: string | null) {
    if (!sections || !sectionId) {
      return "None";
    }
    const sectionName = sections.filter(
      (section: Section) => section.id === sectionId
    );
    return sectionName[0]?.title || "";
  }
  useEffect(() => {
    if (!productsLoaded && products) {
      setTableData(products.reverse());
      setProductsLoaded(true);
    }
  }, [productsLoaded, products]);

  function handleSortProduct() {
    console.log("Run", tableData);
    if (sort === "productDescending") {
      setTableData((prev) => {
        return prev.sort((b, a) => a.title.localeCompare(b.title));
      });
      setSort("productAscending");
    } else {
      setTableData((prev) => {
        return prev.sort((a, b) => a.title.localeCompare(b.title));
      });
      setSort("productDescending");
    }
  }
  function handleEditProduct(product: Product) {
    setEditProductId(product.id);
    setProductTitle(product.title);
    setSectionId(product.sectionId);
    if (sectionOptions.current)
      sectionOptions.current.value = product.sectionId || "";
    setCheckStock(product.checkStock);
    setPublicProduct((prev) => {
      if (product.userId === "") {
        return true;
      } else {
        return false;
      }
    });
  }
  function handleSortSections() {
    console.log("Run", tableData);
    if (sort === "sectionDescending") {
      setTableData((prev) => {
        return prev.sort((b, a) =>
          getSectionName(a.sectionId).localeCompare(getSectionName(b.sectionId))
        );
      });
      setSort("sectionAscending");
    } else {
      setTableData((prev) => {
        return prev.sort((a, b) =>
          getSectionName(a.sectionId).localeCompare(getSectionName(b.sectionId))
        );
      });
      setSort("sectionDescending");
    }
  }

  function validateSave() {
    if (!productTitle) return false;
    if (!sectionId && !newSectionTitle) return false;
    return true;
  }

  function handleDelete() {
    if (editProductId) {
      deleteProduct.mutate({
        id: editProductId,
      });
      handleResetForm();
    }
  }
  function handleSave(sectionId: string) {
    if (editProductId) {
      updateProduct.mutate({
        id: editProductId,
        title: productTitle,
        sectionId,
        checkStock,
        publicProduct,
      });
      setEditProductId(null);
    } else {
      createProduct.mutate({
        title: productTitle,
        sectionId,
        checkStock,
      });
    }
    handleResetForm();
  }
  function handleResetForm() {
    setEditProductId(null);
    setNewSectionTitle("");
    setNewSection(false);
    setCheckStock(false);
    setPublicProduct(false);
    setSectionId(null);
    if (sectionOptions.current) sectionOptions.current.value = "Choose...";
    setProductTitle("");
  }

  return (
    <FormPage>
      <Form2PanelLayout
        leftPanel={
          <>
            <h2 className="">Existing Products</h2>
            <div className="block overflow-scroll rounded-md border bg-primary-content shadow-inner">
              <table className="m-0 w-full">
                <thead className="sticky top-0 shadow">
                  <tr>
                    <th className="bg-primary-content p-2">
                      <button
                        className="font-bold"
                        onClick={() => handleSortProduct()}
                      >
                        Product
                      </button>
                    </th>
                    <th className="bg-primary-content p-2">
                      <button
                        className="font-bold"
                        onClick={() => {
                          handleSortSections();
                        }}
                      >
                        Section
                      </button>
                    </th>
                  </tr>
                </thead>
                <tbody className="overflow-hidden">
                  {tableData?.map((product, idx) => (
                    <tr key={idx}>
                      <td className="p-1">
                        <button
                          onClick={() => handleEditProduct(product)}
                          className="max-w-[12rem] justify-start truncate rounded-md border border-neutral-200 px-2 py-1 text-sm font-semibold normal-case hover:bg-neutral-100"
                        >
                          {product.title}
                        </button>
                      </td>
                      <td className="p-1 pr-7">
                        <div className="w-max max-w-[8rem] truncate whitespace-nowrap rounded-md bg-neutral-50 px-3 py-1 text-left font-semibold">
                          {getSectionName(product.sectionId)}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </>
        }
        rightPanel={
          <>
            <h2 className="mt-0">
              {editProductId ? "Edit" : "Create"} Product
            </h2>
            <div className="grid h-full w-full items-start justify-stretch gap-4">
              <div className="grid w-full gap-4">
                <label className="input-group-md input-group w-full">
                  <span>Title</span>
                  <input
                    type="text"
                    placeholder="Spaghetti (dried)"
                    className="input-bordered input input-md w-full"
                    value={productTitle}
                    onChange={(e) => {
                      setProductTitle(e.target.value);
                    }}
                  />
                </label>
                <label className="input-group-md input-group w-full">
                  <span>Section</span>
                  <select
                    ref={sectionOptions}
                    defaultValue="Choose..."
                    className="select-bordered select max-w-[13rem]"
                    onChange={(e) => {
                      const val = e.target.value;
                      if (val === "Choose...") setSectionId("");
                      else if (val === "Create...") {
                        setNewSection(true);
                        setSectionId(undefined);
                        return;
                      } else {
                        setSectionId(val);
                        setNewSection(false);
                      }
                    }}
                  >
                    <option className="font-light" value="Choose...">
                      Choose...
                    </option>
                    <option className="font-light">Create...</option>
                    {sections?.map((section: Section, idx) => (
                      <option key={idx} value={section.id}>
                        {section.title}
                      </option>
                    ))}
                  </select>
                </label>
                {newSection ? (
                  <label className="input-group-md input-group w-full">
                    <span className="whitespace-nowrap">New Section</span>
                    <input
                      type="text"
                      placeholder="Pet Food Section"
                      className="input-bordered input input-md w-full"
                      value={newSectionTitle}
                      onChange={(e) => {
                        setNewSectionTitle(e.target.value);
                      }}
                    />
                  </label>
                ) : (
                  ""
                )}
                <div className="rounded-lg border">
                  <div className="rounded-t-lg bg-neutral-200 p-2">
                    <label className="prose-sm">
                      Purchased in amounts which last a long time (E.g. Salt):
                    </label>
                  </div>
                  <label className="label cursor-pointer p-2">
                    <span className="label-text">
                      Include reminder cue to check stock
                    </span>
                    <input
                      type="checkbox"
                      checked={checkStock}
                      onChange={() => {
                        setCheckStock((p) => !p);
                      }}
                      className="checkbox checkbox-md"
                    />
                  </label>
                </div>
                <div className="rounded-lg border">
                  <div className="rounded-t-lg bg-neutral-200 p-2">
                    <label className="prose-sm">
                      Make this a public item that website guests can see:
                    </label>
                  </div>
                  <label className="label cursor-pointer p-2">
                    <span className="label-text">Make this a public item</span>
                    <input
                      type="checkbox"
                      checked={publicProduct}
                      onChange={() => {
                        setPublicProduct((p) => !p);
                      }}
                      className="checkbox checkbox-md"
                    />
                  </label>
                </div>
                <button
                  className="btn-success btn w-full"
                  onClick={() => {
                    if (newSectionTitle) {
                      // On success we then run the operation to handle save,
                      // which takes the sectionId for the new section.
                      createSection.mutate({
                        title: newSectionTitle,
                      });
                    } else if (sectionId) {
                      handleSave(sectionId);
                    }
                  }}
                  disabled={!validateSave()}
                >
                  Save
                </button>
              </div>
              <div className="self-end justify-self-end">
                <button
                  className="btn-error btn"
                  disabled={!editProductId}
                  onClick={() => {
                    handleDelete();
                  }}
                >
                  Delete
                </button>
              </div>
            </div>
          </>
        }
      />
    </FormPage>
  );
}

export default Create;
