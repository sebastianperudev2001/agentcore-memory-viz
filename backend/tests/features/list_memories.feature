Feature: List Memories
  As a developer debugging my agent
  I want to list memories stored by my agent
  So that I can inspect what the agent has remembered

  Scenario: Return cached memories when available
    Given a cached list of memories for agent "agent-123"
    When I request memories for agent "agent-123"
    Then I receive 1 memory without calling AgentCore

  Scenario: Fetch from AgentCore on cache miss
    Given no cached memories for agent "agent-123"
    And AgentCore has 1 memory for agent "agent-123"
    When I request memories for agent "agent-123"
    Then I receive 1 memory from AgentCore
