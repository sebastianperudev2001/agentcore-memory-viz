Feature: List and Delete Events
  As a developer debugging my agent
  I want to list and delete events within a session
  So that I can inspect and clean up conversation history

  Scenario: List events for a session
    Given AgentCore has 3 events for memory "mem-1", actor "user-abc", session "sess-1"
    When I request events for memory "mem-1", actor "user-abc", session "sess-1"
    Then I receive 3 events

  Scenario: Delete an event
    Given an event "evt-1" exists for memory "mem-1", actor "user-abc", session "sess-1"
    When I delete event "evt-1" for memory "mem-1", actor "user-abc", session "sess-1"
    Then the event is deleted from AgentCore
