import { redirect } from "next/navigation";

type Props = {
  searchParams: Promise<{ page?: string }>;
};

export default async function ComentariosPage({ searchParams }: Props) {
  const { page } = await searchParams;
  redirect(page ? `/evaluaciones?page=${page}` : "/evaluaciones");
}
