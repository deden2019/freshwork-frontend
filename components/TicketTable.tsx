import Link from "next/link";

export default function TicketTable({
  tickets,
}: {
  tickets: any[];
}) {
  return (
    <table border={1} cellPadding={10}>
      <thead>
        <tr>
          <th>ID</th>
          <th>Subject</th>
        </tr>
      </thead>

      <tbody>
        {tickets.map((ticket) => (
          <tr key={ticket.id}>
            <td>{ticket.id}</td>

            <td>
              <Link
                href={`/tickets/${ticket.id}`}
              >
                {ticket.subject}
              </Link>
            </td>
          </tr>
        ))}
      </tbody>
    </table>
  );
}