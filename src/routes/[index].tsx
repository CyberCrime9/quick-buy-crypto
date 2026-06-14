import { Navigate, createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/index")({
  component: IndexAlias,
});

function IndexAlias() {
  return <Navigate to="/" replace />;
}