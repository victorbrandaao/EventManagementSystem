import { LightningElement, api } from "lwc";
import { ShowToastEvent } from "lightning/platformShowToastEvent";

export default class ParticipantForm extends LightningElement {
  @api eventId; // Este é o ID do evento que será passado do componente pai (eventParticipantsList)

  // Método chamado quando o formulário é salvo com sucesso
  // Desestruturado para pegar apenas 'detail' do objeto 'event'
  handleSuccess({ detail }) {
    const recordId = detail.id; // ID do novo participante criado
    this.showToast("Sucesso!", "Participante criado com sucesso!", "success");

    // Dispara um evento personalizado para o componente pai
    // Avisa ao pai que um participante foi salvo (para que o pai possa atualizar a lista)
    const participantSavedEvent = new CustomEvent("participantsaved", {
      detail: recordId
    });
    this.dispatchEvent(participantSavedEvent);
  }

  // Método chamado se ocorrer um erro ao salvar o formulário
  // Desestruturado para pegar apenas 'detail' do objeto 'event'
  handleError({ detail }) {
    let errorMessage = "Erro ao criar participante";
    if (detail && detail.detail) {
      // A mensagem de erro pode estar em detail.detail
      errorMessage = detail.detail;
    } else if (detail && detail.message) {
      // Ou em detail.message
      errorMessage = detail.message;
    }
    this.showToast("Erro", errorMessage, "error");
  }

  // Método chamado quando o botão 'Cancelar' é clicado
  handleCancel() {
    // Dispara um evento personalizado para o componente pai para fechar o modal
    this.dispatchEvent(new CustomEvent("cancel"));
  }

  // Método auxiliar para exibir mensagens Toast (notificações)
  showToast(title, message, variant) {
    const toastEvent = new ShowToastEvent({
      title: title,
      message: message,
      variant: variant
    });
    this.dispatchEvent(toastEvent);
  }
}
