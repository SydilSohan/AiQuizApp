"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";

import { Checkbox } from "@/components/ui/checkbox";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { GalleryType } from "@/types/types";
import { DeleteFormType, deleteFormSchema } from "@/types/schemas";
import { SortablePhoto } from "./SortablePhoto";
import { Grid } from "./Grid";
import UploadForm from "./UploadForm";
import { useEffect } from "react";
import SubmitButton from "../global/SubmitButton";
import useGetUser from "@/hooks/useGetUser";
import { createClient } from "@/utils/supabase/client";
import { CheckIcon, CheckSquare2 } from "lucide-react";
import { CheckboxIcon } from "@radix-ui/react-icons";

export default function CheckboxForm({
  items,
  setItems,
}: {
  items: GalleryType[];
  setItems: React.Dispatch<React.SetStateAction<GalleryType[]>>;
}) {
  const form = useForm<DeleteFormType>({
    resolver: zodResolver(deleteFormSchema),
  });
  const { user, loading } = useGetUser();
  // async function onSubmit(data: DeleteFormType) {
  //   if (!user) return;
  //   const supabase = createClient();
  //   console.log(data, "data");
  //   ///delete the selected items from items
  //   setItems((prevItems) =>
  //     prevItems.filter((item) =>
  //       data.items.every((value) => value.id !== item.id)
  //     )
  //   );
  //   const { data: deletedData, error } = await supabase
  //     .from("gallery")
  //     .update({
  //       gallery: items,
  //     })
  //     .eq("user_id", user.id);
  //   console.log(deletedData, "deletedData");
  //   if (error) {
  //     console.log(error, "error");
  //     return;
  //   }
  //   form.reset();
  // }
  async function onSubmit(data: DeleteFormType) {
    if (!user) return;
    const supabase = createClient();
    console.log(data, "data");

    // Optimistic update
    // Update the state immediately with the new items
    // This will re-render the component and give the user instant feedback
    const optimisticItems = items.filter((item) =>
      data.items.every((value) => value.id !== item.id)
    );

    setItems(optimisticItems);

    // Send the updated data to the server in the background
    const { data: deletedData, error } = await supabase
      .from("gallery")
      .update({
        gallery: optimisticItems,
      })
      .eq("user_id", user.id);
    console.log(deletedData, "deletedData");

    // If the server update fails, rollback the optimistic update
    if (error) {
      console.log(error, "error");
      setItems(items);
      return;
    }

    form.reset();
  }

  return (
    <>
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="">
          <FormField
            control={form.control}
            name="items"
            render={({ field }) => (
              <FormItem>
                <div className="mb-4 flex justify-between w-full">
                  <div className="flex gap-2">
                    <CheckSquare2 className="text-blue-700" />{" "}
                    <p>
                      {field.value ? field.value.length : "0"} files selected
                    </p>
                  </div>
                  <SubmitButton
                    isLoading={form.formState.isSubmitting}
                    type="submit"
                    variant={"destructive"}
                  >
                    Delete
                  </SubmitButton>
                </div>
                <Grid columns={5}>
                  {items.map((item, index) => (
                    <FormField
                      control={form.control}
                      name="items"
                      render={({ field }) => (
                        <SortablePhoto
                          id={item.id}
                          key={index}
                          url={item.src}
                          index={index}
                        >
                          <FormItem className="z-50 p-4">
                            <FormControl>
                              <Checkbox
                                className="text-2xl bg-white size-5"
                                checked={field.value?.some(
                                  (value) => value.id === item.id
                                )}
                                onCheckedChange={(checked) => {
                                  const fieldValue = Array.isArray(field.value)
                                    ? field.value
                                    : [];
                                  return checked
                                    ? field.onChange([...fieldValue, item])
                                    : field.onChange(
                                        field.value?.filter(
                                          (value) => value.id !== item.id
                                        )
                                      );
                                }}
                              />
                            </FormControl>
                          </FormItem>
                        </SortablePhoto>
                      )}
                    />
                  ))}
                  <UploadForm user={user} items={items} setItems={setItems} />
                </Grid>

                <FormMessage />
              </FormItem>
            )}
          />
        </form>
      </Form>
    </>
  );
}
