trigger ParticipantTrigger on Participant__c(before insert, before update) {
  if (Trigger.isBefore && Trigger.isInsert) {
    // Chamamos o método de serviço para validar a capacidade antes de inserir os novos participantes
    EventParticipantService.validateEventCapacity(Trigger.new);
  }
  // Futuras validações ou lógicas para before update podem ir aqui
  // if (Trigger.isBefore && Trigger.isUpdate) { ... }
}
