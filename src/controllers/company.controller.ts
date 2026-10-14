
import { type Request, type Response, type NextFunction, response } from "express";
import { createCompany ,getCompanies,updateComapny,patchCompany, getCompanyById, deleteCompany} from "../models/company.model.js";

export const addCompany = async (
    req: Request,
    res: Response,
    next: NextFunction
) => {
    try {
        const company = await createCompany(req.body);

        res.status(201).json({
            message: "Company created successfully",
            data: company
        });
    } catch (error) {
        next(error);
    }
};

export const fetchCompanies = async (
    req: Request,
    res: Response,
    next: NextFunction
) => {
    try {
        const companies = await getCompanies();

        res.status(200).json({
            message: "Companies fetched successfully",
            data: companies
        });
    } catch (error) {
        next(error);
    }
};

export const editComapny=async(
    req:Request,
    res:Response,
    next:NextFunction
)=>{
    try{
        const id=Number(req.params.id);
        if(!Number.isInteger(id)||id<=0){
            res.status(400).json({
                message:"Invalid company ID"
            });
            return;
        }
        const{name,website,industry,location}=req.body;

        if(typeof name!=="string" || name.trim()===""){
            res.status(400).json({
                message:"Company name is required"
            });
            return;
        }
        const company=await updateComapny(id,{
            name:name.trim(),
            ...(website!==undefined && {website}),
            ...(industry!==undefined&& {industry}),
            ...(location!==undefined && {location})


        });

        res.status(200).json({
            message:"Company updated successfully",
            data:company
        });

    }
    catch(error){
    next(error);
    }
}

export const partialUpdateCompany=async(
    req:Request,
    res:Response,
    next:NextFunction
)=>{
    try{
        const id=Number(req.params.id);

        if(!Number.isInteger(id)|| id<=0){
            res.status(400).json({
                message:"Invalid company ID"
            });
            return;
        }
        const{name,website,industry,location}=req.body;
        const allowedFeilds=["name","website","industry","location"];
        const suppliedFields=Object.keys(req.body);
        if(suppliedFields.length===0 || suppliedFields.some((field)=>!allowedFeilds.includes(field))){
            res.status(400).json({
                message:"Provide at least one valid field"
            });
            return;
        }

        if(name!==undefined && (typeof name !=="string" || name.trim()==="")){
            res.status(400).json({
                message:"Name must be a non-empty string"
            });
            return;
        }

        for(const[field,value] of Object.entries({
            website,
            industry,
            location
        })){
            if(value!==undefined && value!==null && typeof value!=="string"){
                res.status(400).json({
                    message:`${field} must be a string or null`
                });
                return;
            }
        }

        const company = await patchCompany(id, {
            ...(name !== undefined && { name: name.trim() }),
            ...(website !== undefined && { website }),
            ...(industry !== undefined && { industry }),
            ...(location !== undefined && { location })
        });

        res.status(200).json({
            message: "Company partially updated successfully",
            data: company
        });



    }catch(error){
next(error);

    }
}

export const fetchCompanyById=async(
    req:Request,
    res:Response,
    next:NextFunction
)=>{
    try{
        const id=Number(req.params.id);

        if(!Number.isInteger(id)|| id<=0){
            res.status(400).json({
                message:"Invalid company Id"
            });
            return;
        }

        const company=await getCompanyById(id);

        if(!company){
            res.status(404).json({
                message:"Company not found"
            });
            return;
        }
        res.status(200).json({
            message:"Comapny fetched successfully",
            data:company
        });
    }
    catch(error){
        next(error);
    }
}

export const removeCompany=async(req:Request,res:Response,next:NextFunction)=>{
    try{
        const id=Number(req.params.id);

        if(!Number.isInteger(id)  || id<=0){
            res.status(400).json({
                message:"Invalid company id"
            });
            return;
        }
        const company=await getCompanyById(id);
        if(!company){
            res.status(404).json({
                message:"Comapny not found"
            });
            return;

        }
        await deleteCompany(id);

        res.status(200).json({
            message:"Comapany deleted successfully"
        });

    }
    catch(error){
     next(error);
    }

}

