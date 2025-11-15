"use client";

import {
  Box,
  Button,
  FormControl,
  FormLabel,
  Input,
  Textarea,
  Text,
  VStack,
} from "@chakra-ui/react";
import { useState } from "react";

const AdminActionsPanel = () => {
  const [subject, setSubject] = useState(
    "Town meeting posted for Jamesport parcel"
  );
  const [message, setMessage] = useState(
    "Riverhead planning board agenda now includes the Sound Avenue lot."
  );
  const [status, setStatus] = useState<string | null>(null);
  const [scraperMessage, setScraperMessage] = useState<string | null>(null);

  const triggerAlert = async () => {
    setStatus(null);
    const response = await fetch("/api/alerts/manual", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ subject, message }),
    });
    if (response.ok) {
      setStatus("Alert sent to subscribers.");
    } else {
      setStatus("Failed to send alert.");
    }
  };

  const runScraper = async () => {
    setScraperMessage("Checking Riverhead site…");
    const response = await fetch("/api/scraper/run", { method: "POST" });
    if (response.ok) {
      const data = await response.json();
      setScraperMessage(
        `Scraper finished. Matches found: ${data.matches.length ?? 0}.`
      );
    } else {
      setScraperMessage("Unable to run scraper.");
    }
  };

  return (
    <Box
      bg="white"
      borderRadius="3xl"
      boxShadow="card"
      p={{ base: 5, md: 6 }}
      as="section"
      aria-label="Manual alerts and scraper controls"
    >
      <Text fontSize="xl" fontWeight="700" color="brand.500" mb={4}>
        Rapid response tools
      </Text>
      <VStack spacing={4} align="stretch">
        <FormControl>
          <FormLabel>Alert subject</FormLabel>
          <Input value={subject} onChange={(e) => setSubject(e.target.value)} />
        </FormControl>
        <FormControl>
          <FormLabel>Alert message</FormLabel>
          <Textarea
            rows={3}
            value={message}
            onChange={(e) => setMessage(e.target.value)}
          />
        </FormControl>
        {status && (
          <Text color="brand.600" fontWeight="600">
            {status}
          </Text>
        )}
        <Button onClick={triggerAlert}>Send alert now</Button>
        <Button variant="outline" onClick={runScraper}>
          Run meeting detector
        </Button>
        {scraperMessage && (
          <Text color="gray.600" fontSize="sm">
            {scraperMessage}
          </Text>
        )}
      </VStack>
    </Box>
  );
};

export default AdminActionsPanel;
