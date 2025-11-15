"use client";

import {
  Box,
  Button,
  FormControl,
  FormErrorMessage,
  FormLabel,
  Heading,
  Input,
  Text,
  VStack,
} from "@chakra-ui/react";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { adminLoginSchema } from "@/lib/validators/schemas";

type LoginValues = z.infer<typeof adminLoginSchema>;

const AdminLoginForm = () => {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<LoginValues>({
    resolver: zodResolver(adminLoginSchema),
    defaultValues: {
      email: "",
      password: "",
    },
  });

  const onSubmit = async (values: LoginValues) => {
    setError(null);
    try {
      const response = await fetch("/api/admin/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(values),
      });
      if (!response.ok) {
        throw new Error("Invalid credentials");
      }
      router.push("/admin");
    } catch {
      setError("Login failed. Check your credentials.");
    }
  };

  return (
    <Box
      bg="white"
      borderRadius="3xl"
      boxShadow="card"
      p={{ base: 6, md: 8 }}
      width="full"
      maxW="md"
      as="form"
      onSubmit={handleSubmit(onSubmit)}
    >
      <Heading size="lg" color="brand.500">
        Admin dashboard
      </Heading>
      <Text mt={2} color="gray.600">
        Access is limited to board members and committee leads.
      </Text>
      <VStack mt={6} spacing={5} align="stretch">
        <FormControl isInvalid={!!errors.email}>
          <FormLabel>Email</FormLabel>
          <Input type="email" inputMode="email" {...register("email")} />
          <FormErrorMessage>{errors.email?.message}</FormErrorMessage>
        </FormControl>
        <FormControl isInvalid={!!errors.password}>
          <FormLabel>Password</FormLabel>
          <Input type="password" {...register("password")} />
          <FormErrorMessage>{errors.password?.message}</FormErrorMessage>
        </FormControl>
        {error && (
          <Text color="red.600" fontWeight="600">
            {error}
          </Text>
        )}
        <Button
          type="submit"
          isLoading={isSubmitting}
          size="lg"
          width="full"
        >
          Sign in
        </Button>
      </VStack>
    </Box>
  );
};

export default AdminLoginForm;
