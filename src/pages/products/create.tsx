import { type Product } from "@prisma/client";
import { useSession } from "next-auth/react";
import { api } from "y/utils/api";

function Create() {
  const { data: sessionData } = useSession();
  const createProduct = api.product.create.useMutation({
    onSuccess: async () => {
      await refetchProducts();
    },
  });
  const { data: products, refetch: refetchProducts } =
    api.product.getAll.useQuery();
  return (
    <>
      <input
        type="text"
        placeholder="New Product"
        className="input-bordered input input-md m-2"
        onKeyDown={(e) => {
          if (e.key === "Enter") {
            console.log("Entered: ", e.currentTarget.value);
            createProduct.mutate({
              title: e.currentTarget.value,
            });
            e.currentTarget.value = "";
          }
        }}
      />
      {products?.map((product: Product, idx) => {
        return <div key={idx}>{product.title}</div>;
      })}
    </>
  );
}

export default Create;
