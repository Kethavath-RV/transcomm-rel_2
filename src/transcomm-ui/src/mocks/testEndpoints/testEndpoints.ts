import { Paginated } from 'core/viewModels';
import { rest } from 'msw';
import {
  PrismaOrderByInput,
  PrismaWhereInput,
} from '../../app/models/prismaModels';
import {
  compareFunction,
  noUnusedFields,
  paginateHelper,
} from '../helpers/helperfunctions';
import { GenericTestView } from './testEndpointModels';
import { testDetailsData, testViewData } from './testEndpointObjects';

const baseUrl = '/api/test';
const endpoint = '/service';

export const tests = [
  rest.post(`${baseUrl}${endpoint}`, (req, res, ctx) => {
    const { searchParams, sortParams } = <
      { searchParams: PrismaWhereInput; sortParams: PrismaOrderByInput[] }
    >req.body;
    let response: Paginated<GenericTestView>;
    const searchFields = Object.keys(searchParams);

    const sortFields = Object.keys(sortParams[0]);

    if (searchFields.length === 0 && sortFields.length === 0) {
      response = paginateHelper(testViewData);
      return res(ctx.status(200), ctx.json(response));
    } else {
      if (!noUnusedFields(Object.keys(testViewData[0]), searchFields)) {
        return res(
          ctx.status(400),
          ctx.json({ message: 'Mismatch in filter fields' }),
        );
      }
      if (!noUnusedFields(Object.keys(testViewData[0]), sortFields)) {
        return res(
          ctx.status(400),
          ctx.json({ message: 'Mismatch in sort fields' }),
        );
      }

      let filteredData: GenericTestView[] = testViewData;

      if (searchFields.length > 0) {
        filteredData = filteredData.filter((data) => {
          return searchFields.map((key) => {
            return data[key].includes(searchParams[key]);
          });
        });
      }
      if (sortFields.length > 0) {
        //simple sort based on one field for now
        filteredData.sort((a, b) => {
          return compareFunction(
            a,
            b,
            sortParams[sortFields[0]],
            sortFields[0],
          );
        });
      }

      response = paginateHelper(filteredData);
      return res(ctx.status(200), ctx.json(response));
    }
  }),

  rest.get(`${baseUrl}/:id`, (req, res, ctx) => {
    if (!req.params.id) {
      return res(ctx.status(404), ctx.json({ message: 'id not found' }));
    }
    const matchedObject = testDetailsData.find(
      (obj) => obj.id === req.params.id,
    );

    if (!matchedObject) {
      return res(ctx.status(404), ctx.json({ message: 'id not found' }));
    }

    return res(ctx.status(200), ctx.json(matchedObject));
  }),
  rest.get(`${baseUrl}/`, (_req, res, ctx) => {
    return res(ctx.status(404), ctx.json({ message: 'id not found' }));
  }),
];
