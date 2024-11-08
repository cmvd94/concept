import { Region } from "../../../models/region"; // Adjust the import based on your file structure
import { Grade } from "../../../models/grade"; // Adjust the import based on your file structure

import { MyContext } from "../../apollo";
/* 
export const userQueryResolver = {
  Query: {
    // Resolver for fetching all regions
    //_parent:null Nested resolver:Region->RegionGrade
    allRegions: async (_parent: any, _args: any, context: MyContext) => {
      //console.log("all region");
    
      const regions = await Region.find().lean(); // Fetch regions from database
      return regions; // This result becomes the parent for the nested `grades` resolver
    },
  },
  // _parent: allregion
  Region: {
    grades: async (parent: any, _args: any, _context: MyContext) => {
      //console.log("Fetching grades for region:", parent._id);
      return parent.grades; // Return the grades array for the given region
    },
  },
  // _parent:Region
  RegionGrade: {
    sem: async (parent: any, _args: any, _context: MyContext) => {
      //console.log("Fetching semesters for grade:", parent);
      const grade = await Grade.findOne({ _id: parent.gradeId });

      // If the grade or semesters don't exist, return an empty array
      if (!grade || !grade.semesters || grade.semesters.length === 0) {
        //console.log("inside null")
        return [];
      }

      // Map the semesters to the desired structure
      return grade.semesters.map((semester) => ({
        semesterName: semester.semesterName,
      }));
    },
  },
};
 */
import { RegionType, GradeIn, SemesterIn  } from "../../../types/RegionQuery";
import { Resolver, Query, FieldResolver, Root, Ctx } from "type-graphql";

@Resolver(() => RegionType)
export class UserQueryResolver {
  @Query(() => [RegionType])
  async allRegions(): Promise<RegionType[]> {
    const regions = await Region.find().lean();
    console.log("Fetched regions:", regions); // Log fetched regions

    return regions.map((p) => {
      return {
        _id: p._id,
        regionName: p.regionName,
        grades: p.grades.map((g) => {
          return {
            gradeId: g.gradeId,
            gradeName: g.gradeName,
            semes: [],
          };
        }),
      };
    });
  }

  @FieldResolver(() => [GradeIn])
async grades(@Root() region: RegionType): Promise<GradeIn[]> {
  const grades = region.grades || []; // Ensure this always returns an array
  console.log("Grades found:", grades); // Log found grades
  if (!region.grades) return [];
  
  // Use Promise.all to await asynchronous operations inside map
  const gradeResults = await Promise.all(
    grades.map(async (g) => {
      const foundGrade = await Grade.findOne({ _id: g.gradeId }).lean();
      if (!foundGrade) {
        return null; // Return null if no grade is found
      }

      const semesters = foundGrade.semesters?.map((semester) => ({
        semesterName: semester.semesterName,
      })) || []; // Ensure semesters is always an array
      return {
        gradeId: foundGrade._id,
        gradeName: foundGrade.grade,
        semes: semesters,
      };
    })
  );

  // Filter out any null results (in case no grade was found)
  return gradeResults.filter((g) => g !== null) as GradeIn[]; 
}
 
  @FieldResolver(() => [SemesterIn])
  async semes(@Root() grade: GradeIn): Promise<SemesterIn[]> {
    console.log("Grade received in sem resolver:", grade);
    const foundGrade = await Grade.findOne({ _id: grade.gradeId }).lean();
    console.log("Found grade:", foundGrade);

    if (
      !foundGrade ||
      !foundGrade.semesters ||
      foundGrade.semesters.length === 0
    ) {
      console.log("No semesters found for grade:", grade.gradeId);
      return []; // Always return an array
    }

    const semesters = foundGrade.semesters.map((semester) => ({
      semesterName: semester.semesterName,
    }));
    console.log("Semesters to return:", semesters);
    return semesters;
  }
  
  
}