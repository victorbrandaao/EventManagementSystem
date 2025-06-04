@IsTest
private class EventParticipantServiceTest {
  @IsTest
  static void testValidateEventCapacity_ExceedsCapacity() {
    Event__c testEvent = new Event__c(
      Name = 'Teste Evento Excedente',
      Max_Capacity__c = 2
    );
    insert testEvent;

    Participant__c p1 = new Participant__c(
      Name = 'Participante A',
      Email__c = 'pa@test.com',
      Event__c = testEvent.Id
    );
    Participant__c p2 = new Participant__c(
      Name = 'Participante B',
      Email__c = 'pb@test.com',
      Event__c = testEvent.Id
    );
    insert new List<Participant__c>{ p1, p2 };

    Participant__c pOverCapacity = new Participant__c(
      Name = 'Participante C',
      Email__c = 'pc@test.com',
      Event__c = testEvent.Id
    );

    Test.startTest();
    Database.SaveResult sr = Database.insert(pOverCapacity, false);
    Test.stopTest();

    System.assert(
      !sr.isSuccess(),
      'O participante não deveria ter sido salvo pois excedeu a capacidade.'
    );
    System.assertEquals(
      1,
      sr.getErrors().size(),
      'Deve haver um erro de validação.'
    );
    System.assert(
      sr.getErrors()[0]
        .getMessage()
        .contains('capacidade máxima de 2 participantes'),
      'A mensagem de erro deve indicar capacidade máxima.'
    );

    Integer finalParticipantsCount = [
      SELECT COUNT()
      FROM Participant__c
      WHERE Event__c = :testEvent.Id
    ];
    System.assertEquals(
      2,
      finalParticipantsCount,
      'O número de participantes deve permanecer 2.'
    );
  }

  @IsTest
  static void testValidateEventCapacity_BulkExceedsCapacity() {
    Event__c testEvent = new Event__c(
      Name = 'Teste Evento em Massa',
      Max_Capacity__c = 3
    );
    insert testEvent;

    Participant__c p1 = new Participant__c(
      Name = 'Bulk A',
      Event__c = testEvent.Id
    );
    Participant__c p2 = new Participant__c(
      Name = 'Bulk B',
      Event__c = testEvent.Id
    );
    insert new List<Participant__c>{ p1, p2 };

    List<Participant__c> newParticipants = new List<Participant__c>();
    newParticipants.add(
      new Participant__c(
        Name = 'Bulk C (ok)',
        Email__c = 'bc@test.com',
        Event__c = testEvent.Id
      )
    );
    newParticipants.add(
      new Participant__c(
        Name = 'Bulk D (excede)',
        Email__c = 'bd@test.com',
        Event__c = testEvent.Id
      )
    );

    Test.startTest();
    Database.SaveResult[] results = Database.insert(newParticipants, false);
    Test.stopTest();

    System.assert(
      !results[0].isSuccess(),
      'O primeiro participante deveria ter falhado.'
    );
    System.assert(
      !results[1].isSuccess(),
      'O segundo participante deveria ter falhado.'
    );

    System.assertEquals(
      1,
      results[0].getErrors().size(),
      'O primeiro participante deveria ter 1 erro.'
    );
    System.assertEquals(
      1,
      results[1].getErrors().size(),
      'O segundo participante deveria ter 1 erro.'
    );

    Integer finalParticipantsCount = [
      SELECT COUNT()
      FROM Participant__c
      WHERE Event__c = :testEvent.Id
    ];
    System.assertEquals(
      2,
      finalParticipantsCount,
      'O número de participantes deve permanecer 2.'
    );
  }

  @IsTest
  static void testValidateEventCapacity_DoesNotExceedCapacity() {
    Event__c testEvent = new Event__c(
      Name = 'Teste Evento OK',
      Max_Capacity__c = 5
    );
    insert testEvent;

    Participant__c pOk = new Participant__c(
      Name = 'Participante OK',
      Email__c = 'pok@test.com',
      Event__c = testEvent.Id
    );

    Test.startTest();
    Database.SaveResult sr = Database.insert(pOk, false);
    Test.stopTest();

    System.assert(sr.isSuccess(), 'O participante deveria ter sido salvo.');
    System.assertEquals(
      0,
      sr.getErrors().size(),
      'Não deveria haver erros de validação.'
    );

    Integer finalParticipantsCount = [
      SELECT COUNT()
      FROM Participant__c
      WHERE Event__c = :testEvent.Id
    ];
    System.assertEquals(
      1,
      finalParticipantsCount,
      'O número de participantes deve ser 1.'
    );
  }

  @IsTest
  static void testGetParticipantsByEventId() {
    Event__c testEvent = new Event__c(
      Name = 'Evento Get Participants',
      Max_Capacity__c = 10
    );
    insert testEvent;

    List<Participant__c> participants = new List<Participant__c>();
    participants.add(
      new Participant__c(
        Name = 'Zoe',
        Email__c = 'zoe@example.com',
        Event__c = testEvent.Id
      )
    );
    participants.add(
      new Participant__c(
        Name = 'Alex',
        Email__c = 'alex@example.com',
        Event__c = testEvent.Id
      )
    );
    participants.add(
      new Participant__c(
        Name = 'Charlie',
        Email__c = 'charlie@example.com',
        Event__c = testEvent.Id
      )
    );
    insert participants;

    Event__c otherEvent = new Event__c(
      Name = 'Outro Evento',
      Max_Capacity__c = 1
    );
    insert otherEvent;
    Participant__c otherP = new Participant__c(
      Name = 'Diferente',
      Event__c = otherEvent.Id
    );
    insert otherP;

    Test.startTest();
    List<Participant__c> fetchedParticipants = EventParticipantService.getParticipantsByEventId(
      testEvent.Id
    );
    Test.stopTest();

    System.assert(
      fetchedParticipants != null,
      'A lista de participantes não deve ser nula.'
    ); // <-- LINHA CORRIGIDA
    System.assertEquals(
      3,
      fetchedParticipants.size(),
      'Deveriam haver 3 participantes para este evento.'
    );
    System.assertEquals(
      'Alex',
      fetchedParticipants[0].Name,
      'O primeiro participante deveria ser Alex.'
    );
    System.assertEquals(
      'Charlie',
      fetchedParticipants[1].Name,
      'O segundo participante deveria ser Charlie.'
    );
    System.assertEquals(
      'Zoe',
      fetchedParticipants[2].Name,
      'O terceiro participante deveria ser Zoe.'
    );
  }

  @IsTest
  static void testValidateEventCapacity_NullEvent() {
    Participant__c pNullEvent = new Participant__c(
      Name = 'Participante Sem Evento',
      Email__c = 'null@test.com'
    );

    Test.startTest();
    Database.SaveResult sr = Database.insert(pNullEvent, false);
    Test.stopTest();

    System.assert(
      sr.isSuccess(),
      'O participante sem evento deveria ser salvo.'
    );
    System.assertEquals(0, sr.getErrors().size(), 'Não deveria haver erros.');
  }

  @IsTest
  static void testValidateEventCapacity_ZeroOrNullCapacity() {
    Event__c eventZeroCapacity = new Event__c(
      Name = 'Evento Zero',
      Max_Capacity__c = 0
    );
    insert eventZeroCapacity;

    Event__c eventNullCapacity = new Event__c(Name = 'Evento Nulo');
    insert eventNullCapacity;

    Participant__c pZero = new Participant__c(
      Name = 'P Z',
      Event__c = eventZeroCapacity.Id
    );
    Participant__c pNull = new Participant__c(
      Name = 'P N',
      Event__c = eventNullCapacity.Id
    );

    Test.startTest();
    Database.SaveResult srZero = Database.insert(pZero, false);
    Database.SaveResult srNull = Database.insert(pNull, false);
    Test.stopTest();

    System.assert(
      !srZero.isSuccess(),
      'Participante para evento com capacidade zero deve falhar.'
    );
    System.assert(
      !srNull.isSuccess(),
      'Participante para evento com capacidade nula deve falhar.'
    );

    System.assertEquals(
      1,
      srZero.getErrors().size(),
      'Erro esperado para capacidade zero.'
    );
    System.assertEquals(
      1,
      srNull.getErrors().size(),
      'Erro esperado para capacidade nula.'
    );
  }
}
