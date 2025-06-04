import { LightningElement, api, wire } from "lwc";
import { refreshApex } from "@salesforce/apex";
import { getRecord } from "lightning/uiRecordApi";
import { ShowToastEvent } from "lightning/platformShowToastEvent";

// Importa o campo Max_Capacity__c do objeto Event__c para uso com @wire(getRecord)
import MAX_CAPACITY_FIELD from "@salesforce/schema/Event__c.Max_Capacity__c";
// Importa o método Apex para buscar participantes por EventId
import getParticipantsByEventId from "@salesforce/apex/EventParticipantService.getParticipantsByEventId";

export default class EventParticipantsList extends LightningElement {
  // recordId é preenchido automaticamente com o ID do registro atual quando o LWC está em uma página de registro
  @api recordId;

  // Propriedades reativas para armazenar dados dos participantes e cálculos de capacidade
  participants = {};
  maxCapacity = 0;
  currentParticipants = 0;
  percentageFull = 0;
  wiredParticipantsResult; // Armazena a referência do resultado do wire service para refreshApex

  // Propriedade para controlar a visibilidade do modal do formulário de participante
  isParticipantFormOpen = false;

  // @wire service para obter os detalhes do Evento (especificamente a capacidade máxima)
  @wire(getRecord, { recordId: "$recordId", fields: [MAX_CAPACITY_FIELD] })
  wiredEvent({ error, data }) {
    if (data) {
      this.maxCapacity = data.fields.Max_Capacity__c.value || 0;
      console.log("--- Depuração de Capacidade ---");
      console.log("Record ID:", this.recordId);
      console.log(
        "MAX_CAPACITY_FIELD API Name:",
        MAX_CAPACITY_FIELD.fieldApiName
      );
      console.log(
        "Valor recebido para Max Capacity:",
        data.fields.Max_Capacity__c.value
      );
      console.log("this.maxCapacity (após atribuição):", this.maxCapacity);
      console.log("------------------------------");

      this.updateCapacityDisplay(); // Atualiza a exibição após obter a capacidade
    } else if (error) {
      // Exibe uma mensagem de erro se houver falha ao carregar a capacidade
      this.showToast(
        "Erro",
        "Erro ao carregar capacidade do evento: " + error.body.message,
        "error"
      );
      console.error("Erro ao carregar capacidade do evento", error);
    }
  }

  // @wire service para obter os participantes do Evento chamando o método Apex
  @wire(getParticipantsByEventId, { eventId: "$recordId" })
  wiredParticipants(result) {
    // O objeto 'result' contém 'data' e 'error' e é a referência para refreshApex
    this.wiredParticipantsResult = result; // Armazena a referência para uso posterior com refreshApex
    if (result.data) {
      this.participants.data = result.data; // Atribui os dados recebidos à propriedade 'participants'
      this.participants.error = undefined; // Limpa qualquer erro anterior
      this.currentParticipants = result.data.length; // Atualiza a contagem de participantes

      console.log("--- Depuração de Participantes ---");
      console.log("Número de participantes atuais:", this.currentParticipants);
      console.log("--------------------------------");

      this.updateCapacityDisplay(); // Atualiza a exibição da capacidade
    } else if (result.error) {
      this.participants.error = result.error; // Atribui o erro
      this.participants.data = undefined; // Limpa os dados em caso de erro
      // Exibe uma mensagem de erro se houver falha ao carregar os participantes
      this.showToast(
        "Erro",
        "Erro ao carregar participantes: " + result.error.body.message,
        "error"
      );
      console.error("Erro ao carregar participantes", result.error);
    }
  }

  // Calcula a porcentagem de ocupação e garante que não exceda 100%
  updateCapacityDisplay() {
    if (this.maxCapacity > 0) {
      this.percentageFull = Math.min(
        100,
        (this.currentParticipants / this.maxCapacity) * 100
      );
    } else {
      this.percentageFull = 0; // Se a capacidade máxima é 0 ou nula, a porcentagem é 0
    }
    console.log("--- Depuração de Cálculo ---");
    console.log("this.maxCapacity (no cálculo):", this.maxCapacity);
    console.log(
      "this.currentParticipants (no cálculo):",
      this.currentParticipants
    );
    console.log("this.percentageFull (após cálculo):", this.percentageFull);
    console.log("----------------------------");
  }

  // Getter para determinar a mensagem de status da capacidade (ex: Vagas disponíveis, Lotando, Lotado)
  get capacityStatusMessage() {
    if (this.percentageFull === 0) {
      return "Vagas disponíveis";
    }
    if (this.percentageFull <= 70) {
      // 0-70%
      return "Vagas disponíveis";
    }
    if (this.percentageFull <= 90) {
      // 71-90%
      return "Atenção: Evento lotando!";
    }
    // Se nenhuma das condições acima for verdadeira, o código continua até aqui
    return "Evento lotado ou quase lotado!"; // No lugar do 'else' final
  }

  // Getter para determinar a variante de cor da barra de progresso (base, success, warning, error)
  get progressBarVariant() {
    if (this.percentageFull === 0) {
      return "base"; // Cor padrão
    }
    if (this.percentageFull <= 70) {
      return "success"; // Verde
    }
    if (this.percentageFull <= 90) {
      return "warning"; // Amarelo
    }
    // No lugar do 'else' final
    return "error"; // Vermelho
  }

  // Getter para aplicar classes CSS personalizadas ao texto da porcentagem
  get percentageTextColorClass() {
    if (this.percentageFull === 0) {
      return ""; // Nenhuma classe específica
    }
    if (this.percentageFull <= 70) {
      return "slds-text-color_success"; // Cor de sucesso do SLDS
    }
    if (this.percentageFull <= 90) {
      return "slds-text-color_weak"; // Cor de atenção do SLDS
    }
    // No lugar do 'else' final
    return "slds-text-color_destructive"; // Cor de erro do SLDS
  }

  // Abre o modal do formulário de participante
  openParticipantForm() {
    this.isParticipantFormOpen = true;
  }

  // Fecha o modal do formulário de participante
  closeParticipantForm() {
    this.isParticipantFormOpen = false;
  }

  // Chamado quando o participante é salvo com sucesso pelo componente filho (participantForm)
  handleParticipantSaved() {
    this.closeParticipantForm(); // Fecha o modal após o salvamento bem-sucedido
    // Força o wire service a buscar novamente os dados dos participantes, atualizando a lista
    if (this.wiredParticipantsResult) {
      refreshApex(this.wiredParticipantsResult)
        .then(() => {
          // Opcional: mostrar uma mensagem de sucesso após a atualização da lista
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

  // Método auxiliar para exibir mensagens Toast (notificações do Salesforce)
  showToast(title, message, variant) {
    const toastEvent = new ShowToastEvent({
      title: title,
      message: message,
      variant: variant
    });
    this.dispatchEvent(toastEvent);
  }
}
