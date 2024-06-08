import { Button } from "@/components/ui/button";
import { createClient } from "@/utils/supabase/server";
import Link from "next/link";

async function QuizzesPage() {
  const supabase = createClient();
  const { data, error } = await supabase
    .from("quizzes")
    .select("id, name")
    .limit(10);
  if (error) throw new Error("An error occurred while fetching quizzes");
  return (
    <main className="flex flex-1 flex-col gap-4 p-4 lg:gap-6 lg:p-6">
      <div className="flex items-center justify-between">
        <h1 className="text-lg font-semibold md:text-2xl">Quizzes</h1>

        <Button asChild className="mt-4">
          <Link href={"/account/quizzes/compose"}>Add Quiz</Link>
        </Button>
      </div>

      <TableDemo quizzes={data} />
    </main>
  );
}
export default QuizzesPage;
import {
  Table,
  TableBody,
  TableCaption,
  TableCell,
  TableFooter,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Tables } from "@/types/database";

export function TableDemo({
  quizzes,
}: {
  quizzes: Partial<Tables<"quizzes">>[];
}) {
  return (
    <Table>
      <TableCaption>A list of your recent invoices.</TableCaption>
      <TableHeader>
        <TableRow>
          <TableHead className="w-[100px]">ID</TableHead>
          <TableHead>Name</TableHead>
          <TableHead className="text-right">Action</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {quizzes.map((quiz) => (
          <TableRow key={quiz.id}>
            <TableCell className="font-medium">{quiz.id}</TableCell>

            <TableCell className="font-medium">{quiz.name}</TableCell>
            <TableCell className="text-right">
              <Button asChild>
                <Link href={"/account/quizzes/compose/" + quiz.id}>Edit</Link>
              </Button>
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
}