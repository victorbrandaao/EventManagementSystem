public with sharing class EventParticipantService {
  // Método exposto para o LWC para buscar participantes
  // Anotado com @AuraEnabled(cacheable=true) para ser chamado do JavaScript do LWC.
  // 'cacheable=true' melhora a performance ao permitir que o Salesforce armazene em cache os resultados.
  @AuraEnabled(cacheable=true)
  public static List<Participant__c> getParticipantsByEventId(Id eventId) {
    // Consulta SOQL (Salesforce Object Query Language) para buscar os participantes
    // relacionados a um evento específico. Ordena pelo nome para uma lista consistente.
    // Garanta que os campos 'Name' e 'Email__c' são incluídos, pois são usados no LWC.
    return [
      SELECT Id, Name, Email__c
      FROM Participant__c
      WHERE Event__c = :eventId
      ORDER BY Name ASC
    ];
  }

  // Método principal para validar a capacidade do evento.
  // Este método é chamado pelo Trigger 'ParticipantTrigger' antes da inserção de novos participantes.
  public static void validateEventCapacity(
    List<Participant__c> newParticipants
  ) {
    // Usa um Set para armazenar IDs de Eventos únicos. Sets são eficientes para evitar duplicatas.
    Set<Id> eventIds = new Set<Id>();
    for (Participant__c p : newParticipants) {
      // Adiciona o ID do evento ao Set apenas se o participante estiver associado a um evento.
      if (p.Event__c != null) {
        eventIds.add(p.Event__c);
      }
    }

    // Se nenhum participante na lista tiver um evento associado, não há nada para validar.
    if (eventIds.isEmpty()) {
      return;
    }

    // Mapeia EventId para o objeto Evento completo, incluindo a lista de Participantes já existentes.
    // A subconsulta '(SELECT Id FROM Participants__r)' é crucial para obter a contagem de participantes existentes.
    // 'Participants__r' é o nome do relacionamento reverso (child relationship name)
    // para o objeto Participant__c no Event__c.
    Map<Id, Event__c> eventsWithDetails = new Map<Id, Event__c>(
      [
        SELECT Id, Name, Max_Capacity__c, (SELECT Id FROM Participants__r)
        FROM Event__c
        WHERE Id IN :eventIds
      ]
    );

    // Mapa para contar quantos participantes estão sendo inseridos para CADA evento
    // dentro desta transação (Trigger.new). Isso é essencial para o bulkification correto.
    Map<Id, Integer> newParticipantsCountByEvent = new Map<Id, Integer>();
    for (Participant__c p : newParticipants) {
      if (p.Event__c != null) {
        // Incrementa a contagem para o evento correspondente.
        newParticipantsCountByEvent.put(
          p.Event__c,
          newParticipantsCountByEvent.get(p.Event__c) != null
            ? newParticipantsCountByEvent.get(p.Event__c) + 1
            : 1
        );
      }
    }

    // Iterar sobre cada novo participante que está tentando ser inserido.
    for (Participant__c newP : newParticipants) {
      // Apenas processa se o participante tem um evento associado e o evento existe.
      // AQUI ESTÁ A MUDANÇA: Removemos a verificação 'fullEvents.contains' para garantir que cada registro
      // que excede a capacidade receba o erro individualmente em uma inserção em massa.
      if (
        newP.Event__c != null && eventsWithDetails.containsKey(newP.Event__c)
      ) {
        Event__c relatedEvent = eventsWithDetails.get(newP.Event__c);

        // Obtém o número de participantes JÁ EXISTENTES para este evento.
        Integer currentAttendees = relatedEvent.Participants__r != null
          ? relatedEvent.Participants__r.size()
          : 0;

        // Obtém a capacidade máxima do evento. Se for nula, assume 0 para fins de validação.
        Integer maxCapacity = relatedEvent.Max_Capacity__c != null
          ? (Integer) relatedEvent.Max_Capacity__c
          : 0;

        // Calcula o número total PROJETADO de participantes se todos os novos participantes
        // para este evento forem adicionados.
        Integer projectedAttendees =
          currentAttendees + newParticipantsCountByEvent.get(relatedEvent.Id);

        // Lógica de Validação Central:
        // O evento está lotado se:
        // 1. A capacidade máxima é zero ou negativa (não permite inscrições).
        // OU
        // 2. O número projetado de participantes excede a capacidade máxima.
        if (maxCapacity <= 0 || projectedAttendees > maxCapacity) {
          // Adiciona uma mensagem de erro ao campo Event__c do participante.
          // Isso impede que o registro seja salvo e exibe a mensagem ao usuário.
          // A correção aqui: String.valueOf(maxCapacity) para garantir que ambos os lados do ternário sejam String.
          newP.Event__c.addError(
            'Este evento atingiu sua capacidade máxima de ' +
              (maxCapacity != null ? String.valueOf(maxCapacity) : '0') +
              ' participantes.'
          );
          // REMOVEMOS A LINHA 'fullEvents.add(relatedEvent.Id);'
          // Isso garante que todos os registros que contribuem para a superlotação recebam o erro.
        }
      }
    }
  }
}
