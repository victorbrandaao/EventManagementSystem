import { LightningElement, api, wire } from "lwc";
import { refreshApex } from "@salesforce/apex"; // ADICIONADO
import { getRecord } from "lightning/uiRecordApi";
import { ShowToastEvent } from "lightning/platformShowToastEvent";
import { NavigationMixin } from "lightning/navigation";

import MAX_CAPACITY_FIELD from "@salesforce/schema/Event__c.Max_Capacity__c";
import getParticipantsByEventId from "@salesforce/apex/EventParticipantService.getParticipantsByEventId"; // Mudei de EventParticipantController para Service

export default class EventParticipantsList extends NavigationMixin(
  LightningElement
) {
  @api recordId;

  participants = {};
  maxCapacity = 0;
  currentParticipants = 0;
  percentageFull = 0;

  // Variável para armazenar a referência do wired service para participants
  wiredParticipantsResult; // <--- NOVA VARIÁVEL

  // Wire service para obter os detalhes do Evento (capacidade máxima)
  @wire(getRecord, { recordId: "$recordId", fields: [MAX_CAPACITY_FIELD] })
  wiredEvent({ error, data }) {
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

  // Wire service para obter os participantes do Evento
  @wire(getParticipantsByEventId, { eventId: "$recordId" })
  wiredParticipants(result) {
    // <--- AGORA 'result' É O OBJETO COMPLETO DO WIRE SERVICE
    this.wiredParticipantsResult = result; // <--- ARMAZENA A REFERÊNCIA
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

  // Método para lidar com o clique do botão "Adicionar Novo Participante"
  handleAddParticipant() {
    // Navega para a página de criação de novo Participant__c
    this[NavigationMixin.Navigate](
      {
        type: "standard__objectPage",
        attributes: {
          objectApiName: "Participant__c",
          actionName: "new"
        },
        state: {
          // Preenche automaticamente o campo Event__c no novo Participant__c
          nooverride: "1",
          defaultFieldValues: JSON.stringify({
            Event__c: this.recordId
          })
        }
      },
      true // <-- ADICIONADO: 'true' para indicar que esta navegação é para um objeto padrão e não para fechar o tab
      // e para que a promessa de navegação retorne o controle
    )
      .then((result) => {
        // Este .then() é executado após a navegação ser concluída e o usuário voltar
        // do formulário de criação (se eles clicarem em salvar ou cancelar).
        // É a forma mais simples de acionar o refresh para esta navegação padrão.
        if (result) {
          // Verifica se a navegação realmente ocorreu
          // Chama refreshApex APENAS SE houver um resultado (ou seja, a navegação aconteceu)
          // e a propriedade wiredParticipantsResult foi definida (se o wire service já carregou)
          if (this.wiredParticipantsResult) {
            refreshApex(this.wiredParticipantsResult)
              .then(() => {
                this.showToast(
                  "Sucesso!",
                  "Lista de participantes atualizada.",
                  "success"
                );
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
      })
      .catch((error) => {
        this.showToast(
          "Erro",
          "Erro ao navegar: " + error.body.message,
          "error"
        );
        console.error("Erro de navegação:", error);
      });
  }

  showToast(title, message, variant) {
    const event = new ShowToastEvent({
      title: title,
      message: message,
      variant: variant
    });
    this.dispatchEvent(event);
  }
}