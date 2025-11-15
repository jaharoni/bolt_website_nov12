"use client";

import {
  Box,
  Button,
  FormControl,
  FormLabel,
  Select,
  Textarea,
  Text,
} from "@chakra-ui/react";
import { useState } from "react";

const SummaryTool = () => {
  const [sourceUrl, setSourceUrl] = useState(
    "https://www.townofriverheadny.gov/AgendaCenter/ViewFile/Agenda/_11052024-1088"
  );
  const [content, setContent] = useState("");
  const [audience, setAudience] = useState("residents");
  const [summary, setSummary] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const summarize = async () => {
    setLoading(true);
    setSummary(null);
    const response = await fetch("/api/summarize", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ sourceUrl, content, audience }),
    });
    const data = await response.json();
    setSummary(data.summary ?? "Unable to summarize.");
    setLoading(false);
  };

  return (
    <Box
      bg="white"
      borderRadius="3xl"
      boxShadow="card"
      p={{ base: 5, md: 6 }}
      as="section"
    >
      <Text fontSize="xl" fontWeight="700" color="brand.500" mb={4}>
        AI zoning summary
      </Text>
      <FormControl mb={4}>
        <FormLabel>Source URL</FormLabel>
        <Textarea
          rows={2}
          value={sourceUrl}
          onChange={(e) => setSourceUrl(e.target.value)}
        />
      </FormControl>
      <FormControl mb={4}>
        <FormLabel>Audience</FormLabel>
        <Select value={audience} onChange={(e) => setAudience(e.target.value)}>
          <option value="residents">Residents</option>
          <option value="board">Board leadership</option>
          <option value="volunteers">Volunteers</option>
        </Select>
      </FormControl>
      <FormControl mb={4}>
        <FormLabel>Paste agenda text</FormLabel>
        <Textarea
          rows={6}
          value={content}
          onChange={(e) => setContent(e.target.value)}
        />
      </FormControl>
      <Button onClick={summarize} isLoading={loading}>
        Generate summary
      </Button>
      {summary && (
        <Box mt={4} bg="gray.50" borderRadius="2xl" p={4}>
          <Text fontWeight="600" color="brand.500">
            Draft summary
          </Text>
          <Text mt={2} color="gray.700">
            {summary}
          </Text>
        </Box>
      )}
    </Box>
  );
};

export default SummaryTool;
