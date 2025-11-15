"use client";

import {
  Box,
  Button,
  Checkbox,
  FormControl,
  FormErrorMessage,
  FormLabel,
  Input,
  SimpleGrid,
  Stack,
  Text,
  Textarea,
} from "@chakra-ui/react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { registrationSchema } from "@/lib/validators/schemas";
import { useState } from "react";

type RegistrationValues = z.infer<typeof registrationSchema>;

const defaultValues: RegistrationValues = {
  name: "",
  email: "",
  phone: "",
  volunteerRole: "",
  alertPrefs: {
    generalUpdates: true,
    meetingAlerts: true,
    volunteerOpportunities: false,
    smsOptIn: false,
    keywords: [],
  },
};

const RegistrationForm = () => {
  const [status, setStatus] = useState<"idle" | "success" | "error">("idle");
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<RegistrationValues>({
    resolver: zodResolver(registrationSchema),
    defaultValues,
  });

  const onSubmit = async (values: RegistrationValues) => {
    setStatus("idle");
    try {
      const response = await fetch("/api/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(values),
      });
      if (!response.ok) {
        throw new Error("Request failed");
      }
      setStatus("success");
      reset();
    } catch (error) {
      console.error(error);
      setStatus("error");
    }
  };

  return (
    <Box
      as="form"
      onSubmit={handleSubmit(onSubmit)}
      aria-label="Registration form"
      bg="white"
      borderRadius="3xl"
      boxShadow="card"
      p={{ base: 6, md: 8 }}
    >
      <Text fontSize="2xl" fontWeight="700" color="brand.500" mb={2}>
        Stay in the loop
      </Text>
      <Text color="gray.600" mb={6}>
        Get email or SMS alerts about hearings, site plan updates, and volunteer
        days. Double opt-in keeps the list secure.
      </Text>

      <SimpleGrid columns={{ base: 1, md: 2 }} spacing={5}>
        <FormControl isInvalid={!!errors.name}>
          <FormLabel>Full name</FormLabel>
          <Input {...register("name")} placeholder="Pat Morgan" />
          <FormErrorMessage>{errors.name?.message}</FormErrorMessage>
        </FormControl>
        <FormControl isInvalid={!!errors.email}>
          <FormLabel>Email</FormLabel>
          <Input
            type="email"
            inputMode="email"
            {...register("email")}
            placeholder="you@email.com"
          />
          <FormErrorMessage>{errors.email?.message}</FormErrorMessage>
        </FormControl>
        <FormControl isInvalid={!!errors.phone}>
          <FormLabel>Mobile phone (optional)</FormLabel>
          <Input
            type="tel"
            inputMode="tel"
            {...register("phone")}
            placeholder="(631) 555-1234"
          />
          <FormErrorMessage>{errors.phone?.message}</FormErrorMessage>
        </FormControl>
        <FormControl>
          <FormLabel>Volunteer role (optional)</FormLabel>
          <Textarea
            {...register("volunteerRole")}
            placeholder="Zoning research, canvassing, translation, etc."
            rows={2}
          />
        </FormControl>
      </SimpleGrid>

      <Stack mt={6} spacing={4}>
        <Text fontWeight="700" color="brand.600">
          Alert preferences
        </Text>
        <Checkbox {...register("alertPrefs.generalUpdates")}>
          Monthly project digest & legislative summaries
        </Checkbox>
        <Checkbox {...register("alertPrefs.meetingAlerts")}>
          Meeting alerts (sent within 30 minutes of detection)
        </Checkbox>
        <Checkbox {...register("alertPrefs.volunteerOpportunities")}>
          Volunteer opportunities
        </Checkbox>
        <Checkbox {...register("alertPrefs.smsOptIn")}>
          SMS alerts (message/data rates may apply)
        </Checkbox>
      </Stack>

      {status === "success" && (
        <Box
          mt={6}
          p={4}
          bg="green.50"
          borderRadius="xl"
          color="green.800"
          fontWeight="600"
        >
          Thanks! Check your email for the confirmation link.
        </Box>
      )}
      {status === "error" && (
        <Box
          mt={6}
          p={4}
          bg="red.50"
          borderRadius="xl"
          color="red.800"
          fontWeight="600"
        >
          Something went wrong. Please try again or email info@jamesportcivic.org.
        </Box>
      )}

      <Button
        mt={8}
        type="submit"
        isLoading={isSubmitting}
        size="lg"
        width="full"
      >
        Request confirmation email
      </Button>
    </Box>
  );
};

export default RegistrationForm;
