import SecretCard from "../secrets/SecretCard";

function SecretGrid({ secrets, token, onRefresh }) {
  if (!secrets || secrets.length === 0) {
    return <p>No secrets found.</p>;
  }

  return (
    <div className="secret-grid">
      {secrets.map((secret) => (
        <SecretCard
          key={secret.id}
          secret={secret}
          token={token}
          onRefresh={onRefresh}
        />
      ))}
    </div>
  );
}

export default SecretGrid;