import type { NextFunction, Request, Response } from "express";
import { students } from "../models/student.model.js";

export const getStudents = (
    req: Request,
    res: Response
) => {
    res.json(students);
};

export const addStudent = (
    req: Request,
    res: Response
) => {
    const existingStudent = students.find(
        student => student.id === req.body.id
    );

    if (existingStudent) {
        res.status(409).json({
            message: "student already exists"
        });
        return;
    }

    students.push(req.body);

    res.status(201).json(req.body);
};

export const getStudentById = (
    req: Request,
    res: Response
) => {
    const id = Number(req.params.id);

    const student = students.find(
        student => student.id === id
    );

    if (student) {
        res.json(student);
    } else {
        res.status(404).json({
            message: "Student not found"
        });
    }
};

export const updateStudent = (
    req: Request,
    res: Response
) => {
    const id = Number(req.params.id);

    const index = students.findIndex(
        student => student.id === id
    );

    if (index === -1) {
        res.status(404).json({
            message: "Student not found"
        });
        return;
    }

    const student = students[index];

    if (!student) {
        res.status(404).json({
            message: "Student not found"
        });
        return;
    }

    if (
        !req.body.name ||
        req.body.name.trim().length === 0 ||
        !req.body.branch ||
        req.body.branch.trim().length === 0
    ) {
        res.status(400).json({
            message: "Name and branch are required"
        });
        return;
    }

    student.name = req.body.name;
    student.branch = req.body.branch;

    res.json(student);
};

export const deleteStudentById = (
    req: Request,
    res: Response
) => {
    const id = Number(req.params.id);

    const index = students.findIndex(
        student => student.id === id
    );

    if (index === -1) {
        res.status(404).json({
            message: "Student not found"
        });
        return;
    }

    const student = students[index];

    if (!student) {
        res.status(404).json({
            message: "Cannot delete student"
        });
        return;
    }

    students.splice(index, 1);

    res.json({
        message: "student deleted successfully"
    });
};

export const patchStudent = (
    req: Request,
    res: Response
) => {
    const id = Number(req.params.id);

    const index = students.findIndex(
        student => student.id === id
    );

    if (index === -1) {
        res.status(404).json({
            message: "student does not exist"
        });
        return;
    }

    const student = students[index];

    if (!student) {
        res.status(404).json({
            message: "student not found"
        });
        return;
    }

    if (
        req.body.name !== undefined &&
        req.body.name.trim().length === 0
    ) {
        res.status(400).json({
            message: "Name cannot be empty"
        });
        return;
    }

    if (req.body.name !== undefined) {
        student.name = req.body.name;
    }

    if (
        req.body.branch !== undefined &&
        req.body.branch.trim().length === 0
    ) {
        res.status(400).json({
            message: "Branch cannot be empty"
        });
        return;
    }

    if (req.body.branch !== undefined) {
        student.branch = req.body.branch;
    }

    res.json(student);
};

export const testError = (
    req: Request,
    res: Response,
    next: NextFunction
) => {
    next(new Error("Test error"));
};