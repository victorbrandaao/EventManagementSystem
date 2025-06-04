import { LightningElement, api, wire } from "lwc";
import { refreshApex } from "@salesforce/apex";
import { getRecord } from "lightning/uiRecordApi";
import { ShowToastEvent } from "lightning/platformShowToastEvent";

import MAX_CAPACITY_FIELD from "@salesforce/schema/Event__c.Max_Capacity__c";
import getParticipantsByEventId from "@salesforce/apex/EventParticipantService.getParticipantsByEventId";

export default class EventParticipantsList extends LightningElement {
  @api recordId;

  participants = {};
  maxCapacity = 0;
  currentParticipants = 0;
  percentageFull = 0;
  wiredParticipantsResult;

  isParticipantFormOpen = false; // Controla a visibilidade do modal

  @wire(getRecord, { recordId: "$recordId", fields: [MAX_CAPACITY_FIELD] })
  wiredEvent({ error, data }) {
    // Desestruturado: pegamos apenas 'error' e 'data' de 'result'
    if (data) {
      this.maxCapacity = data.fields.Max_Capacity__c.value || 0;
      this.updateCapacityDisplay();
    } else if (error) {
      this.showToast(
        "Erro",
        "Erro ao carregar capacidade do evento: " + error.body.message,
        "error"
      );
      console.error("Erro ao carregar capacidade do evento", error);
    }
  }

  @wire(getParticipantsByEventId, { eventId: "$recordId" })
  wiredParticipants(result) {
    // Mantemos 'result' aqui pois a referência completa é usada por 'refreshApex'
    this.wiredParticipantsResult = result;
    if (result.data) {
      this.participants.data = result.data;
      this.participants.error = undefined;
      this.currentParticipants = result.data.length;
      this.updateCapacityDisplay();
    } else if (result.error) {
      this.participants.error = result.error;
      this.participants.data = undefined;
      this.showToast(
        "Erro",
        "Erro ao carregar participantes: " + result.error.body.message,
        "error"
      );
      console.error("Erro ao carregar participantes", result.error);
    }
  }

  updateCapacityDisplay() {
    if (this.maxCapacity > 0) {
      this.percentageFull = Math.min(
        100,
        (this.currentParticipants / this.maxCapacity) * 100
      );
    } else {
      this.percentageFull = 0;
    }
  }

  // Abre o modal do formulário de participante
  openParticipantForm() {
    this.isParticipantFormOpen = true;
  }

  // Fecha o modal do formulário de participante
  closeParticipantForm() {
    this.isParticipantFormOpen = false;
  }

  // Chamado quando o participante é salvo com sucesso pelo participantForm
  handleParticipantSaved() {
    // Não precisamos do parâmetro 'event' aqui, pois não o usamos
    this.closeParticipantForm(); // Fecha o modal
    // Atualiza a lista de participantes no componente pai
    if (this.wiredParticipantsResult) {
      refreshApex(this.wiredParticipantsResult)
        .then(() => {
          // Opcional: Mostrar uma mensagem de sucesso após o refresh
          // this.showToast('Sucesso!', 'Lista de participantes atualizada.', 'success');
        })
        .catch((error) => {
          this.showToast(
            "Erro",
            "Erro ao atualizar lista: " + error.body.message,
            "error"
          );
        });
    }
  }

  showToast(title, message, variant) {
    const toastEvent = new ShowToastEvent({
      title: title,
      message: message,
      variant: variant
    });
    this.dispatchEvent(toastEvent);
  }
}
