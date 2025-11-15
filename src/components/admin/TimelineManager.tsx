"use client";

import { useState } from "react";
import { TimelineEvent } from "@/lib/types";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { timelineEventSchema } from "@/lib/validators/schemas";
import {
  Box,
  Button,
  FormControl,
  FormErrorMessage,
  FormLabel,
  Input,
  Select,
  Textarea,
  VStack,
  HStack,
  Text,
  Badge,
} from "@chakra-ui/react";

type FormValues = z.infer<typeof timelineEventSchema>;

const defaultValues: FormValues = {
  title: "",
  date: new Date().toISOString().slice(0, 10),
  eventType: "zoning",
  description: "",
  tags: [],
  documents: [],
  status: "draft",
};

const TimelineManager = ({ initialEvents }: { initialEvents: TimelineEvent[] }) => {
  const [events, setEvents] = useState(initialEvents);
  const [activeId, setActiveId] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<FormValues>({
    resolver: zodResolver(timelineEventSchema),
    defaultValues,
  });

  const onSubmit = async (values: FormValues) => {
    setMessage(null);
    try {
      const response = await fetch(
        activeId ? `/api/timeline/${activeId}` : "/api/timeline",
        {
          method: activeId ? "PUT" : "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(values),
        }
      );
      if (!response.ok) {
        throw new Error("Request failed");
      }
      const record = await response.json();
      if (activeId) {
        setEvents((prev) =>
          prev.map((event) => (event.id === activeId ? record : event))
        );
        setMessage("Event updated.");
      } else {
        setEvents((prev) => [...prev, record]);
        setMessage("Event added.");
      }
      reset(defaultValues);
      setActiveId(null);
    } catch {
      setMessage("Unable to save event.");
    }
  };

  const handleEdit = (event: TimelineEvent) => {
    setActiveId(event.id);
    reset({
      title: event.title,
      date: event.date,
      eventType: event.eventType,
      description: event.description,
      tags: event.tags ?? [],
      sourceUrl: event.sourceUrl,
      status: event.status ?? "draft",
      documents: event.documents ?? [],
      location: event.location,
    });
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm("Delete this event?")) return;
    await fetch(`/api/timeline/${id}`, { method: "DELETE" });
    setEvents((prev) => prev.filter((event) => event.id !== id));
    if (activeId === id) {
      reset(defaultValues);
      setActiveId(null);
    }
  };

  return (
    <div className="grid gap-8 lg:grid-cols-2">
      <Box
        bg="white"
        borderRadius="3xl"
        boxShadow="card"
        p={{ base: 5, md: 6 }}
        as="form"
        onSubmit={handleSubmit(onSubmit)}
      >
        <Text fontSize="xl" fontWeight="700" color="brand.500" mb={4}>
          {activeId ? "Edit timeline event" : "Add timeline event"}
        </Text>
        <VStack spacing={4} align="stretch">
          <FormControl isInvalid={!!errors.title}>
            <FormLabel>Title</FormLabel>
            <Input {...register("title")} />
            <FormErrorMessage>{errors.title?.message}</FormErrorMessage>
          </FormControl>
          <FormControl isInvalid={!!errors.date}>
            <FormLabel>Date</FormLabel>
            <Input type="date" {...register("date")} />
            <FormErrorMessage>{errors.date?.message}</FormErrorMessage>
          </FormControl>
          <FormControl>
            <FormLabel>Event type</FormLabel>
            <Select {...register("eventType")}>
              <option value="zoning">Zoning</option>
              <option value="ownership">Ownership</option>
              <option value="development">Development</option>
              <option value="hearing">Hearing</option>
              <option value="legislation">Legislation</option>
              <option value="meeting">Meeting</option>
            </Select>
          </FormControl>
          <FormControl isInvalid={!!errors.description}>
            <FormLabel>Description</FormLabel>
            <Textarea rows={4} {...register("description")} />
            <FormErrorMessage>{errors.description?.message}</FormErrorMessage>
          </FormControl>
          <FormControl>
            <FormLabel>Source URL</FormLabel>
            <Input placeholder="https://..." {...register("sourceUrl")} />
          </FormControl>
          <FormControl>
            <FormLabel>Status</FormLabel>
            <Select {...register("status")}>
              <option value="draft">Draft</option>
              <option value="published">Published</option>
              <option value="archived">Archived</option>
            </Select>
          </FormControl>
          {message && (
            <Text color="brand.600" fontWeight="600">
              {message}
            </Text>
          )}
          <Button type="submit" isLoading={isSubmitting} size="lg">
            {activeId ? "Update event" : "Add event"}
          </Button>
          {activeId && (
            <Button
              variant="outline"
              onClick={() => {
                reset(defaultValues);
                setActiveId(null);
              }}
            >
              Cancel edit
            </Button>
          )}
        </VStack>
      </Box>

      <div className="space-y-4">
        {events.map((event) => (
          <div
            key={event.id}
            className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm"
          >
            <HStack justifyContent="space-between" alignItems="center">
              <div>
                <Text fontWeight="700" color="brand.500">
                  {event.title}
                </Text>
                <Text fontSize="sm" color="gray.500">
                  {event.date} • {event.eventType}
                </Text>
              </div>
              <Badge colorScheme={event.status === "published" ? "green" : "gray"}>
                {event.status ?? "draft"}
              </Badge>
            </HStack>
            <Text mt={3} color="gray.600">
              {event.description}
            </Text>
            <HStack mt={4} spacing={3}>
              <Button size="sm" onClick={() => handleEdit(event)}>
                Edit
              </Button>
              <Button
                size="sm"
                variant="outline"
                onClick={() => handleDelete(event.id)}
              >
                Delete
              </Button>
            </HStack>
          </div>
        ))}
        {events.length === 0 && (
          <p className="text-slate-600">
            No events yet. Add the first milestone using the form.
          </p>
        )}
      </div>
    </div>
  );
};

export default TimelineManager;
