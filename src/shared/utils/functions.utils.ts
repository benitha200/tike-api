import { HttpException, HttpStatus } from '@nestjs/common';

const generateRandomToken = (length: number = 6): string => {
  try {
    let minDigits = parseInt('1' + Array(length).join('0').toString());
    let maxDigits = parseInt(
      Array(length + 1)
        .join('9')
        .toString(),
    );

    let min = Math.ceil(minDigits);
    let max = Math.floor(maxDigits);
    return (Math.floor(Math.random() * (max - min + 1)) + min).toString();
  } catch (error) {
    throw new HttpException(
      error.message,
      error.status || HttpStatus.INTERNAL_SERVER_ERROR,
    );
  }
};

const generateCode = (name: string): string => {
  try {
    let trimmedName = name
      .toUpperCase()
      .replace(/[^a-zA-Z ]/g, '')
      .replace(/\s+/g, '')
      .substring(0, 5);

    const threeStartingStringFromDate = Date.now().toString().substring(1, 4);
    const twoEndingStringFromDate = Date.now().toString().substring(9, 11);

    return `${trimmedName}${threeStartingStringFromDate}${twoEndingStringFromDate}`;
  } catch (error) {
    throw new HttpException(
      error.message,
      error.status || HttpStatus.INTERNAL_SERVER_ERROR,
    );
  }
};

export { generateCode, generateRandomToken };
