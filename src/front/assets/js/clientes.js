import { collection, onSnapshot, orderBy, query } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js";

// Certifique-se de que 'db' foi inicializado globalmente no HTML ou passe-o como argumento.
// Se você seguiu o passo anterior, 'window.db' estará disponível.
const db = window.db;

const notificacoesUl = document.getElementById('notificacoes');

if (notificacoesUl && db) {
  // Cria uma query para buscar orçamentos, ordenados pela data de envio
  const q = query(collection(db, "orcamentos"), orderBy("dataEnvio", "desc"));

  // onSnapshot cria um listener em tempo real:
  // toda vez que um orçamento é adicionado, modificado ou removido,
  // a função callback é executada e a lista é atualizada automaticamente.
  onSnapshot(q, (snapshot) => {
    notificacoesUl.innerHTML = ''; // Limpa a lista antes de adicionar os novos itens

    if (snapshot.empty) {
      notificacoesUl.innerHTML = '<li class="notification-item">Nenhum orçamento pendente no momento.</li>';
      return;
    }

    snapshot.forEach((doc) => {
      const orcamento = doc.data();
      const li = document.createElement('li');
      li.classList.add('notification-item'); // Adiciona uma classe para estilização

      // Formatação da data (se existir)
      let dataFormatada = 'Data não disponível';
      if (orcamento.dataEnvio && orcamento.dataEnvio.toDate) {
        dataFormatada = orcamento.dataEnvio.toDate().toLocaleString('pt-BR', {
          year: 'numeric', month: '2-digit', day: '2-digit',
          hour: '2-digit', minute: '2-digit'
        });
      }

      let detalhesEspecificos = '';
      if (orcamento.tipoOrcamento === 'escolar') {
        detalhesEspecificos = `
          <strong>Escola:</strong> ${orcamento.escola || 'Não informado'}<br>
          <strong>Turno:</strong> ${orcamento.turno || 'Não informado'}<br>
          <strong>CEP:</strong> ${orcamento.cepEscolar || 'Não informado'}<br>
        `;
      } else if (orcamento.tipoOrcamento === 'viagem') {
        detalhesEspecificos = `
          <strong>Destino:</strong> ${orcamento.destino || 'Não informado'}<br>
          <strong>Data Ida:</strong> ${orcamento.dataIda || 'Não informado'}<br>
          <strong>Data Volta:</strong> ${orcamento.dataVolta || 'Não informado'}<br>
        `;
      }

      li.innerHTML = `
        <div class="notification-header">
          <h4>Orçamento de ${orcamento.nome}</h4>
          <span class="notification-date">${dataFormatada}</span>
        </div>
        <div class="notification-body">
          <p><strong>Email:</strong> ${orcamento.email}</p>
          <p><strong>Telefone:</strong> ${orcamento.telefone}</p>
          <p><strong>Tipo:</strong> ${orcamento.tipoOrcamento === 'escolar' ? 'Transporte Escolar' : orcamento.tipoOrcamento === 'viagem' ? 'Fretamento / Viagem' : 'Outro'}</p>
          ${detalhesEspecificos}
          <p><strong>Mensagem:</strong> ${orcamento.mensagem || 'N/A'}</p>
        </div>
      `;
      notificacoesUl.appendChild(li);
    });
  }, (error) => {
    console.error("Erro ao buscar orçamentos:", error);
    notificacoesUl.innerHTML = '<li class="notification-item error-item">Erro ao carregar orçamentos. Tente novamente mais tarde.</li>';
  });
} else {
  console.warn("Elemento 'notificacoes' ou 'db' não encontrado. Verifique seu HTML e inicialização do Firebase.");
}